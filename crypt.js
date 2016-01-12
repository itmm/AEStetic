'use strict';

// create table DOM elements

function addRound(round, $parent, $before, prefix, headerClasses, contentClasses) {
	var $header = newTag('li', prefix + 'hdr', headerClasses);
	var $a = setTxt(newTag('a'), 'round ' + round);
	var $spn = newTag('span', null, 'icon-expand');
	$a.appendChild($spn);
	$header.appendChild($a);
	$parent.insertBefore($header, $before);

	var $cell = newTag('li', prefix + 'cnt', contentClasses);
	$parent.insertBefore($cell, $before);
	var $div = newTag('div', null, 'card');
	var $container = newTag('ul');
	$div.appendChild($container);
	$cell.appendChild($div);
	$parent.insertBefore($cell, $before);

	$a.addEventListener('click', function(evt) {
		toggleDiv(this, $spn, [$cell]);
		evt.preventDefault();
	});

	return $container;
}

function addSubEntry(name, block, prefix, $container) {
	var $li = setTxt(newTag('li'), name);
	$container.appendChild($li);
	var $entry = newTag('li', null, 'referable');
	writeBytes($entry, block, prefix, true);
	$container.appendChild($entry);
}


// do encoding

function applyInput(block, state, prefix, prevPrefix) {
	_.each(block, function(val, i) {
		var idx = prefix + i;
		aes.addDependencies(idx, [prevPrefix + i]);
		if (prevPrefix == 'input-') {
			aes.addDependencies(idx, ['key-' + i, 'expanded-key-' + i]);
			aes.addCalculations(idx, [
				fb(val) + " = input[" + i + "] ⊕ key[" + i + "]"
			]);
		} else if (prevPrefix == 'out-') {
			aes.addDependencies(idx, ['key-' + i, 'expanded-key-' + i]);
			aes.addCalculations(idx, [
				fb(val) + " = out[" + i + "] ⊕ key[" + (state.rounds * block.length + i) + "]"
			]);				
		} else {
			aes.addCalculations(idx, "block[" + i + "]");
		}
	});	
	return block;	
}

function applySBox(block, sbox, prefix, prevPrefix) {
	return _.map(block, function(val, i) {
		var idx = prefix + i;
		aes.addDependencies(idx, [prevPrefix + i, 'sbox-' + val]);
		var res = sbox[val];
		aes.addCalculations(idx, fb(res) + " = S-Box[" + fb(val) + "]");
		return res;				
	});
}

function applyInvSBox(block, invsbox, prefix, prevPrefix) {
	return _.map(block, function(val, i) {
		var idx = prefix + i;
		var res = invsbox[val];
		aes.addDependencies(idx, [prevPrefix + i, 'sbox-' + res]);
		aes.addCalculations(idx, [
			fb(val) + " = S-Box[i]",
			"⇒ i = " + fb(res),
			"i"
		]);
		return res;				
	});
}

function applyPermute(block, permute, prefix, prevPrefix) {
	return _.map(block, function(_, i) {
		var j = permute[i];
		var idx = prefix + i;
		aes.addDependencies(idx, [prevPrefix + j, 'permute-' + i]);
		aes.addCalculations(idx, [
			"i ← " + j + " = permute[" + i + "]",
			fb(block[j]) + " = block[i]"
		]);
		return block[j];
	});
}

function applyInvPermute(block, invpermute, prefix, prevPrefix) {
	return _.map(block, function(_, i) {
		var j = invpermute[i];
		var idx = prefix + i;
		aes.addDependencies(idx, [prevPrefix + j, 'permute-' + j]);
		aes.addCalculations(idx, [
			i + " = permute[i]",
			"⇒ i = " + j,
			fb(block[j]) + " = block[i]"
		]);
		return block[j];
	});
}

function singleMultStep(b, f, i, id) {
	if (f == 1) { return b; }
	var res = mult(f, b);
	aes.addCalculations(id, "s" + i + " ← " + fb(res) + " = " + fb(f) + " × " + fb(b));
	return res;
}

function singleMult(b0, b1, b2, b3, f0, f1, f2, f3, id) {
	var s0 = singleMultStep(b0, f0, 0, id);
	var s1 = singleMultStep(b1, f1, 1, id);
	var s2 = singleMultStep(b2, f2, 2, id);
	var s3 = singleMultStep(b3, f3, 3, id);

	var r0 = f0 == 1 ? fb(b0) : "s0";
	var r1 = f1 == 1 ? fb(b1) : "s1";
	var r2 = f2 == 1 ? fb(b2) : "s2";
	var r3 = f3 == 1 ? fb(b3) : "s3";

	var a = s0 ^ s1;
	var b = s2 ^ s3;
	var res = a ^ b;

	aes.addCalculations(id, [
		"a ← " + fb(a) + " = " + r0 + " ⊕ " + r1,
		"b ← " + fb(b) + " = " + r2 + " ⊕ " + r3,
		fb(res) + " = a ⊕ b"
	]);

	return res;
}

function applyMults(block, f0, f1, f2, f3, prefix, prevPrefix) {
	var l = block.length/4;
	for (var i = 0; i < l; ++i) {
		var j = 4 * i;
		var b0 = block[j];
		var b1 = block[j + 1];
		var b2 = block[j + 2];
		var b3 = block[j + 3];
		var m0 = singleMult(b0, b1, b2, b3, f0, f1, f2, f3, prefix + j);
		var m1 = singleMult(b0, b1, b2, b3, f3, f0, f1, f2, prefix + (j + 1));
		var m2 = singleMult(b0, b1, b2, b3, f2, f3, f0, f1, prefix + (j + 2));
		var m3 = singleMult(b0, b1, b2, b3, f1, f2, f3, f0, prefix + (j + 3));
		block[j] = m0;
		block[j + 1] = m1;
		block[j + 2] = m2;
		block[j + 3] = m3;
		var deps = _.map([j, j + 1, j + 2, j + 3], function(k) {
			return prevPrefix + k;
		});
		_.each(deps, function(_, k) { aes.addDependencies(prefix + (j + k), deps); });
	}
	return block;
}

function applySubkey(block, round, expandedKey, prefix, prevPrefix) {
	return _.map(block, function(_, i) {
		var idx = prefix + i;
		var j = block.length * round + i;
		aes.addDependencies(idx, 'expanded-key-' + j);
		aes.addCalculations(idx, [
			"bs ← " + block.length,
			"round ← " + round,
			"i ← " + i,
			"j ← " + j + " = bs × round + i",
			fb(expandedKey[j]) + " = key[j]"
		]);
		return expandedKey[j];
	});
}

function applyMixWithKey(block, subkey, prefix, prevPrefix, keyPrefix) {
	return _.map(block, function(val, i) {
		var idx = prefix + i;
		aes.addDependencies(idx, [prevPrefix + i, keyPrefix + i]);
		var res = val ^ subkey[i];
		aes.addCalculations(idx, [
			fb(res) + " = " + fb(val) + " ⊕ " + fb(subkey[i])
		]);
		return res;
	});	
}

function encode(state, expandedKey) {
	var $computation = $('rounds');
	var $computation_end = $('rounds-end');
	var $parent = $computation.parentNode;
	removeBetween($computation, $computation_end);

	var block = _.map(Array(state.blockSize), function(_, i) {
		return state.input[i] ^ expandedKey[i];
	});

	var roundHeaderClasses;
	var roundContentClasses;
	if ($('toggle-enc-label').classList.contains('icon-collapse')) {
		roundHeaderClasses = null;
		roundContentClasses = ['hidden', 'sub'];

	} else {
		roundHeaderClasses = 'hidden';
		roundContentClasses = ['hidden', 'hidden-2', 'sub'];
	}

	var lastPrefix = 'input-';
	for (var round = 1; round <= state.rounds; ++round) {
		var rnd = 'r-' + round;
		var $container = addRound(round, $parent, $computation_end, 'r-enc-' + round + '-', roundHeaderClasses, roundContentClasses);

		var rndInput = rnd + '-input-';
		block = applyInput(block, state, rndInput, lastPrefix);
		addSubEntry('input to round ' + round, block, rndInput, $container, true);

		// sbox

		var rndSBox = rnd + '-sbox-';
		block = applySBox(block, state.sbox, rndSBox, rndInput);
		addSubEntry('after S-Box:', block, rndSBox, $container, true);

		// permute

		var rndPermute = rnd + '-permute-';
		block = applyPermute(block, state.permute, rndPermute, rndSBox);
		addSubEntry('after permutation:', block, rndPermute, $container, true);
		lastPrefix = rndPermute;

		// mult

		if (round < state.rounds) {
			var rndMult = rnd + '-mult-';
			block = applyMults(block, 0x2, 0x3, 0x1, 0x1, rndMult, rndPermute);
			addSubEntry('after mult:', block, rndMult, $container, true);
			lastPrefix = rndMult;
		}

		// mix key

		var rnd_subkey = rnd + '-subkey-';
		var key = applySubkey(block, round, expandedKey, rnd_subkey, lastPrefix);
		addSubEntry('used subkey:', key, rnd_subkey, $container, true);

		var rnd_key = rnd + '-key-';
		block = applyMixWithKey(block, key, rnd_key, lastPrefix, rnd_subkey);
		addSubEntry('after mix with key:', block, rnd_key, $container, true);
		lastPrefix = rnd_key;
	}

	writeBytes($('output'), block, 'out-', true);
	_.each(block, function(val, i) {
		aes.addDependencies('out-' + i, lastPrefix + i);
	});
	return block;
}


// do decoding

function decode(block, state, expandedKey) {
	var $computation = $('decode-rounds');
	var $computation_end = $('decode-rounds-end');
	var $parent = $computation.parentNode;
	removeBetween($computation, $computation_end);

	var dec = Array(state.blockSize);
	var dec2 = Array(state.blockSize);

	var dependent = Array(state.blockSize);
	var dependent2 = Array(state.blockSize);

	var inv_permute = Array(state.blockSize);
	var inv_sbox = Array(256);

	_.each(state.permute, function(val, i) { inv_permute[val] = i; });
	_.each(state.sbox, function(val, i) { inv_sbox[val] = i; });

	dec = _.map(dec, function(_ ,i) {
		dependent[i] = ['out-' + i, 'expanded-key-' + (state.rounds * state.blockSize + i)];
		return block[i] ^ expandedKey[state.rounds * state.blockSize + i];
	});

	var roundHeaderClasses;
	var roundContentClasses;
	if ($('toggle-dec-label').classList.contains('icon-collapse')) {
		roundHeaderClasses = null;
		roundContentClasses = ['hidden', 'sub'];

	} else {
		roundHeaderClasses = 'hidden';
		roundContentClasses = ['hidden', 'hidden-2', 'sub'];
	}
	var lastPrefix = 'out-';
	for (var i = state.rounds - 1; i >= 0; --i) {
		var rnd = 'd-' + (i + 1);
		var $container = addRound(i + 1, $parent, $computation_end, 'r-dec-' + (i + 1) + '-', roundHeaderClasses, roundContentClasses);

		var rnd_input = rnd + '-input-';
		dec = applyInput(dec, state, rnd_input, lastPrefix);
		addSubEntry('input to round:', dec, rnd_input, $container, true);

		// permute

		var rnd_permute = rnd + '-permute-';
		dec = applyInvPermute(dec, inv_permute, rnd_permute, rnd_input);
		addSubEntry('after permute:', dec, rnd_permute, $container, true);

		// sbox

		var rnd_sbox = rnd + '-sbox-';
		dec = applyInvSBox(dec, inv_sbox, rnd_sbox, rnd_permute);
		addSubEntry('after S-Box:', dec, rnd_sbox, $container, true);

		// mix with key

		var rnd_subkey = rnd + '-subkey-';
		var key = applySubkey(dec, i, expandedKey, rnd_subkey, rnd_sbox);
		addSubEntry('used subkey:', key, rnd_subkey, $container, true);

		var rnd_key = rnd + '-key-';
		dec = applyMixWithKey(dec, key, rnd_key, lastPrefix, rnd_subkey);
		addSubEntry('after mix with key:', block, rnd_key, $container, true);
		lastPrefix = rnd_key;

		// mult

		if (i > 0) {
			var rndMult = rnd + '-mult-';
			dec = applyMults(dec, 0xe, 0xb, 0xd, 0x9, rndMult, rnd_key);
			addSubEntry('after mult:', dec, rndMult, $container, true);
			lastPrefix = rndMult;
		}

	}

	writeBytes($('decoded'), dec, 'dec-', true);
	_.each(dec, function(_, j) { aes.addDependencies('dec-' + j, lastPrefix + j); });
}

