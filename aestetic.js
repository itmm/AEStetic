'use strict';

window.addEventListener('load', function () {

	var state = {
		'sbox': defaults.sbox.slice(),
		'permute': defaults.permute.slice(),
		'key': testcases[0].key.slice(),
		'input': testcases[0].input.slice(),
		'rounds': testcases[0].rounds,
		'blockSize': defaults.blockSize
	};



// insert byte strings into DOM

	function writeBytes($dest, ary, prefix, activeCells) {
		var grouping = 4;
		var len = ary.length;

		removeChilds($dest);

		for (var i = 0; i < len; i += grouping) {
			var $div = newTag('div');
			for (var j = 0; j < grouping; ++j) {
				var k = i + j;
				var $span = newTag('span', prefix + k);
				if (activeCells) {
					$span.addEventListener('click', doCellClick);
				}
				appendChild($div, setTxt($span, formatByte(ary[k])), j > 0);
			}
			appendChild($dest, $div, i);
		}
	}


// handle state

	var is_rijndael = false;
	var is_aes128 = false;
	var is_aes192 = false;
	var is_aes256 = false;
	var usedTestcase = null;

	function checkForKnownConfigurations() {
		is_rijndael = false;
		is_aes128 = false;
		is_aes192 = false;
		is_aes256 = false;
		usedTestcase = null;

		if (_.equals(state.sbox, defaults.sbox) && _.equals(state.permute, defaults.permute)) {
			switch (state.key.length) {
				case 16:
					if (state.rounds >= 10 && state.rounds <= 14) {
						is_rijndael = true;
						is_aes128 = (state.rounds == 10);
					}
					break;
				case 20:
					if (state.rounds >= 11 && state.rounds <= 14) {
						is_rijndael = true;
					}
					break;
				case 24:
					if (state.rounds >= 12 && state.rounds <= 14) {
						is_rijndael = true;
						is_aes192 = (state.rounds == 12);
					}
					break;
				case 28:
					if (state.rounds >= 13 && state.rounds <= 14) {
						is_rijndael = true;
					}
					break;
				case 32:
					if (state.rounds == 14) {
						is_rijndael = true;
						is_aes256 = true;

					}
					break;
			}

			if (is_aes256 || is_aes192 || is_aes128) {
				for (var i = 0; i < testcases.length; ++i) {
					var tc = testcases[i];
					var isTestcaseKey = _.equals(state.key, tc.key);
					var isTestcaseInput = _.equals(state.input, tc.input);
					if (state.rounds == tc.rounds && isTestcaseKey && isTestcaseInput) {
						usedTestcase = tc;
					}
				}
			}
		}		
		var $badge = $('badge');
		setClass($badge, 'badge-aes256', is_aes256);
		setClass($badge, 'badge-aes192', is_aes192);
		setClass($badge, 'badge-aes128', is_aes128);
		setClass($badge, 'badge-rijndael', is_rijndael && !(is_aes256 || is_aes192 || is_aes128));
		setClass($badge, 'badge-unknown', !is_rijndael);
	}

	function refreshState() {
		setTxt($('rounds-label'), state.rounds);
		setClass($('dec-rounds'), 'disabled', state.rounds <= 1);

		writeBytes($('sbox'), state.sbox, 'sbox-', false);
		writeBytes($('permute'), state.permute, 'permute-', false);
		writeBytes($('key'), state.key, 'key-', false);
		writeBytes($('input'), state.input, 'input-', false);

		checkForKnownConfigurations();

		setClass($('reference'), 'hidden', usedTestcase == null);
		setClass($('reference-bytes'), 'hidden', usedTestcase == null);
		if (usedTestcase) {
			writeBytes($('reference-bytes'), usedTestcase.encoded, false);
		}
	}


// test vector handling

	function updateTestvectors() {
		var $container = $('testvectors-container');
		removeChilds($container);
		_.each(testcases, function(testcase) {
			var $li = newTag('li');
			var $a = newTag('a');
			setTxt($a, testcase.name);
			$li.appendChild($a);
			$container.appendChild($li);
			$a.addEventListener('click', function(evt) {
				state.sbox = defaults.sbox.slice();
				state.permute = defaults.permute.slice();
				state.key = testcase.key.slice();
				state.input = testcase.input.slice();
				state.rounds = testcase.rounds;
				state.blockSize = defaults.blockSize;
				refresh();
				evt.preventDefault();
			});
		});
	}



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

	function polyDependency(frm, to, i) {
		to[i] = [frm[i][0], frm[i + 1][0], frm[i + 2][0], frm[i + 3][0]];
		to[i + 1] = to[i];
		to[i + 2] = to[i];
		to[i + 3] = to[i];
	}

	function applyInput(block, prefix, prevPrefix) {
		_.each(block, function(val, i) {
			var idx = prefix + i;
			addDependencies(idx, [prevPrefix + i]);
			if (prevPrefix == 'input-') {
				addDependencies(idx, ['key-' + i, 'expanded-key-' + i]);
				addCalculations(idx, [
					fb(val) + " = input[" + i + "] ⊕ key[" + i + "]"
				]);
			} else {
				addCalculations(idx, "block[" + i + "]");
			}
		});	
		return block;	
	}

	function applySBox(block, sbox, prefix, prevPrefix) {
		return _.map(block, function(val, i) {
			var idx = prefix + i;
			addDependencies(idx, [prevPrefix + i, 'sbox-' + val]);
			var res = sbox[val];
			addCalculations(idx, fb(res) + " = S-Box[" + fb(val) + "]");
			return res;				
		});
	}

	function applyPermute(block, permute, prefix, prevPrefix) {
		return _.map(block, function(_, i) {
			var j = permute[i];
			var idx = prefix + i
			addDependencies(idx, [prevPrefix + j, 'permute-' + i]);
			addCalculations(idx, [
				"i ← " + j + " = permute[" + i + "]",
				fb(block[j]) + " = block[i]"
			]);
			return block[j];
		});
	}

	function singleMultStep(b, f, i, id) {
		if (f == 1) { return b; }
		var res = mult(f, b);
		addCalculations(id, "s" + i + " ← " + fb(res) + " = " + fb(f) + " × " + fb(b));
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

		addCalculations(id, [
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
			_.each(deps, function(_, k) { addDependencies(prefix + (j + k), deps); });
		}
		return block;
	}

	function applySubkey(block, round, expandedKey, prefix, prevPrefix) {
		return _.map(block, function(_, i) {
			var idx = prefix + i;
			var j = block.length * round + i;
			addDependencies(idx, 'expanded-key-' + j);
			addCalculations(idx, [
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
			addDependencies(idx, [prevPrefix + i, keyPrefix + i]);
			var res = val ^ subkey[i];
			addCalculations(idx, [
				fb(res) + " = " + fb(val) + " ⊕ " + fb(subkey[i])
			]);
			return res;
		});	
	}

	function encode(expandedKey) {
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
			block = applyInput(block, rndInput, lastPrefix);
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
			addDependencies('out-' + i, lastPrefix + i);
		});
		return block;
	}


// do decoding

	function decode(block, expandedKey) {
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
		for (var i = state.rounds - 1; i >= 0; --i) {
			var rnd = 'd-' + (i + 1);
			var $container = addRound(i + 1, $parent, $computation_end, 'r-dec-' + (i + 1) + '-', roundHeaderClasses, roundContentClasses);

			var rnd_input = rnd + '-input-';
			dependent = _.map(dependent, function(val, j) {
				addDependencies(rnd_input + j, val);
				addCalculations(rnd_input + j,
					fb(dec[j]) + " = block[" + j + "]"
				);
				return [rnd_input + j];
			});
			addSubEntry('input to round:', dec, rnd_input, $container, true);

			// permute

			var rnd_permute = rnd + '-permute-';
			dec2 = _.map(dec2, function(_, j) {
				dependent2[j] = dependent[inv_permute[j]];
				dependent2[j].push('permute-' + inv_permute[j]);
				addDependencies(rnd_permute + j, dependent2[j]);
				var k = inv_permute[j];
				addCalculations(rnd_permute + j, [
					j + " = permute[i]",
					"⇒ i = " + k,
					fb(dec[k]) + " = block[i]"
				]);
				return dec[k];
			});
			addSubEntry('after permute:', dec2, rnd_permute, $container, true);
			dependent = _.map(dependent, function(_, j) { return [rnd_permute + j]; });

			// sbox

			var rnd_sbox = rnd + '-sbox-';
			dec = _.map(dec, function(_, j) {
				dependent[j].push('sbox-' + inv_sbox[dec2[j]]);
				addDependencies(rnd_sbox + j, dependent[j]);
				dependent[j] = [rnd_sbox + j];
				addCalculations(rnd_sbox + j, [
					fb(dec2[j]) + " = S-Box[i]",
					"⇒ i = " + fb(inv_sbox[dec2[j]]),
					"i"
				]);
				return inv_sbox[dec2[j]];
			});
			addSubEntry('after S-Box:', dec, rnd_sbox, $container, true);

			// mix with key

			var rnd_subkey = rnd + '-subkey-';
			dec2 = _.map(dec2, function(_, j) {
				addDependencies(rnd_subkey + j, 'expanded-key-' + j);
				var k = state.blockSize * i + j;
				addCalculations(rnd_subkey + j, [
					"bs ← " + state.blockSize,
					"round ← " + i,
					"i ← " + j,
					"j ← " + k + " = bs × round + i",
					fb(expandedKey[k]) + " = key[j]"
				]);
				return expandedKey[k];
			});
			addSubEntry('used subkey:', dec2, rnd_subkey, $container, true);

			var rnd_key = rnd + '-key-';
			dec = _.map(dec, function(val, j) {
				dependent[j].push('expanded-key-' + (i * state.blockSize + j));
				dependent[j].push(rnd_subkey + j);
				addDependencies(rnd_key + j, dependent[j]);
				dependent[j] = [rnd_key + j];
				var k = i * state.blockSize + j;
				addCalculations(rnd_key + j,
					fb(val ^ expandedKey[k]) + " = " + fb(val) + " ⊕ " + fb(expandedKey[k])
				);
				return val ^ expandedKey[k];
			});
			addSubEntry('after mix with key:', dec, rnd_key, $container, true);

			// mult

			if (i > 0) {
				var rnd_mult = rnd + '-mult-';
				for (var j = 0; j < state.blockSize/4; ++j) {
					var s0 = dec[4 * j];
					var s1 = dec[4 * j + 1];
					var s2 = dec[4 * j + 2];
					var s3 = dec[4 * j + 3];

					var s0e = mult(0x0e, s0);
					var s1b = mult(0x0b, s1);
					var s2d = mult(0x0d, s2);
					var s39 = mult(0x09, s3);

					var s0exs1b = s0e ^ s1b;
					var s2dxs39 = s2d ^ s39;

					dec[4 * j] = s0exs1b ^ s2dxs39;

					var s09 = mult(0x09, s0);
					var s1e = mult(0x0e, s1);
					var s2b = mult(0x0b, s2);
					var s3d = mult(0x0d, s3);
					var s09xs1e = s09 ^ s1e;
					var s2bxs3d = s2b ^ s3d;

					dec[4 * j + 1] = s09xs1e ^ s2bxs3d;

					var s0d = mult(0x0d, s0);
					var s19 = mult(0x09, s1);
					var s2e = mult(0x0e, s2);
					var s3b = mult(0x0b, s3);
					var s0dxs19 = s0d ^ s19;
					var s2exs3b = s2e ^ s3b;

					dec[4 * j + 2] = s0dxs19 ^ s2exs3b;

					var s0b = mult(0x0b, s0);
					var s1d = mult(0x0d, s1);
					var s29 = mult(0x09, s2);
					var s3e = mult(0x0e, s3);
					var s0bxs1d = s0b ^ s1d;
					var s29xs3e = s29 ^ s3e;

					dec[4 * j + 3] = s0bxs1d ^ s29xs3e;

					polyDependency(dependent, dependent2, 4 * j);

					var fbs0 = fb(s0);
					var fbs1 = fb(s1);
					var fbs2 = fb(s2);
					var fbs3 = fb(s3);

					addCalculations(rnd_mult + (4 * j), [
						"s0 ← " + fb(s0e) + " = 0x0e × " + fbs0,
						"s1 ← " + fb(s1b) + " = 0x0b × " + fbs1,
						"s2 ← " + fb(s2d) + " = 0x0d × " + fbs2,
						"s3 ← " + fb(s39) + " = 0x09 × " + fbs3,
						"a ← " + fb(s0exs1b) + " = s0 ⊕ s1",
						"b ← " + fb(s2dxs39) + " = s2 ⊕ s3",
						fb(dec[4 * j]) + " = a ⊕ b"
					]);
					addCalculations(rnd_mult + (4 * j + 1), [
						"s0 ← " + fb(s09) + " = 0x09 × " + fbs0,
						"s1 ← " + fb(s1e) + " = 0x0e × " + fbs1,
						"s2 ← " + fb(s2b) + " = 0x0b × " + fbs2,
						"s3 ← " + fb(s3d) + " = 0x0d × " + fbs3,
						"a ← " + fb(s09xs1e) + " = s0 ⊕ s1",
						"b ← " + fb(s2bxs3d) + " = s2 ⊕ s3",
						fb(dec[4 * j + 1]) + " = a ⊕ b"
					]);
					addCalculations(rnd_mult + (4 * j + 2), [
						"s0 ← " + fb(s0d) + " = 0x0d × " + fbs0,
						"s1 ← " + fb(s19) + " = 0x09 × " + fbs1,
						"s2 ← " + fb(s2e) + " = 0x0e × " + fbs2,
						"s3 ← " + fb(s3b) + " = 0x0b × " + fbs3,
						"a ← " + fb(s0dxs19) + " = s0 ⊕ s1",
						"b ← " + fb(s2exs3b) + " = s2 ⊕ s3",
						fb(dec[4 * j + 2]) + " = a ⊕ b"
					]);
					addCalculations(rnd_mult + (4 * j + 3), [
						"s0 ← " + fb(s0b) + " = 0x0b × " + fbs0,
						"s1 ← " + fb(s1d) + " = 0x0d × " + fbs1,
						"s2 ← " + fb(s29) + " = 0x09 × " + fbs2,
						"s3 ← " + fb(s3e) + " = 0x0e × " + fbs3,
						"a ← " + fb(s0bxs1d) + " = s0 ⊕ s1",
						"b ← " + fb(s29xs3e) + " = s2 ⊕ s3",
						fb(dec[4 * j + 3]) + " = a ⊕ b"
					]);
				}
				addSubEntry('after mult:', dec, rnd_mult, $container, true);
				dependent = _.map(dependent, function(_, k) {
					addDependencies(rnd_mult + k, dependent2[k]);
					return [rnd_mult + k];
				});
			}
		}

		writeBytes($('decoded'), dec, 'dec-', true);
		_.each(dependent, function(val, j) { addDependencies('dec-' + j, val); });
	}


// recalculate fields

	function refresh() {
		relayout();
		resetDependencies();
		refreshState();
		updateTestvectors();
		var expandedKey = expandKey(state);
		writeBytes($('expanded-key'), expandedKey, 'expanded-key-', true);
		var encoded = encode(expandedKey);
		decode(encoded, expandedKey);
	}

	refresh();


// toggle collapse/expand

	function hideLevel($elm) {
		var level = 0;
		if ($elm.classList.contains('hidden')) {
			level = 1;
			while ($elm.classList.contains('hidden-' + (level + 1))) {
				++level;
			}
		}
		return level;
	}

	function hide($elm) {
		var level = hideLevel($elm);
		if (level <= 0) {
			addClass($elm, 'hidden');
		} else {
			addClass($elm, 'hidden-' + (level + 1));
		}
	}

	function unhide($elm) {
		var level = hideLevel($elm);
		if (level <= 1) {
			removeClass($elm, 'hidden');
		} else {
			removeClass($elm, 'hidden-' + level);
		}
	}

	function setHide($elm, doHide) {
		if (doHide) {
			hide($elm);
		} else {
			unhide($elm);
		}
	}

	function toggleDiv($a, $span, $divs) {
		var collapse = $span.classList.contains('icon-collapse');
		setClass($span, 'icon-collapse', !collapse);
		setClass($span, 'icon-expand', collapse);
		_.each($divs, function($div) { setHide($div, collapse); });
		relayout();
	}

	function addToggleDiv(a, divs, span) {
		divs = _.map(divs, function(div) { return $(div); });
		$(a).addEventListener('click', function(evt) {
			var $span = span ? $(span) : this.lastChild;
			toggleDiv(this, $span, divs);
			evt.preventDefault();
		});
	}

	addToggleDiv('toggle-configuration', ['testvectors-toggler', 'testvectors', 'rounds-toggler', 'rounds-config', 'sbox-toggler', 'sbox', 'permute-toggler', 'permute'], 'conf-label')
	addToggleDiv('toggle-rounds', ['rounds-config']);
	addToggleDiv('toggle-testvectors', ['testvectors']);
	addToggleDiv('toggle-sbox', ['sbox']);
	addToggleDiv('toggle-permute', ['permute']);

	addToggleDiv('toggle-key', ['key', 'expanded-key-toggler', 'expanded-key']);
	addToggleDiv('toggle-expanded-key', ['expanded-key']);

	addToggleDiv('toggle-input', ['input']);

	function setRoundsToggle($a, prefix) {
		$a.addEventListener('click', function(evt) {
			var $divs = [];
			for (var i = 1; i <= state.rounds; ++i) {
				$divs.push($(prefix + i + '-hdr'));
				$divs.push($(prefix + i + '-cnt'));
			}
			toggleDiv(this, this.lastChild, $divs);
			evt.preventDefault();
		});
	}

	setRoundsToggle($('toggle-enc-rounds'), 'r-enc-');
	setRoundsToggle($('toggle-dec-rounds'), 'r-dec-');

	addToggleDiv('toggle-encoded', ['output']);
	addToggleDiv('toggle-reference', ['reference-bytes']);
	addToggleDiv('toggle-decoded', ['decoded']);

// change round count

	function addChangeRounds(a, delta) {
		$(a).addEventListener('click', function(evt) {
			var newRounds = state.rounds + delta;
			if (newRounds > 0) {
				state.rounds = newRounds;
				refresh();
			}
			evt.preventDefault();
		});
	}

	addChangeRounds('inc-rounds', 1);
	addChangeRounds('dec-rounds', -1);


// update parameters

	function isValidHexDigit(digit) {
		return ('0' <= digit) && ('9' >= digit) || ('a' <= digit) && ('f' >= digit) || ('A' <= digit) && ('F' >= digit);
	}

	function updateBytes(message, bytes, validator) {
		var current = '';
		_.each(bytes, function(byte) {
			current += formatByte(byte);			
		});
		var entered = prompt(message, current);
		if (entered == '') { return; }

		var result = [];
		var lastNibble = 0;
		var hasLastNibble = false;
		for (var i = 0; i < entered.length; ++i) {
			if (i < entered.length && entered[i] <= ' ') {
				if (hasLastNibble) {
					result.push(lastNibble);
					lastNibble = 0;
					hasLastNibble = false;
				}
			} else if (isValidHexDigit(entered[i])) {
				var value = lastNibble * 16 + parseInt(entered[i], 16);
				if (hasLastNibble) {
					result.push(value);
					lastNibble = 0;
					hasLastNibble = false;
				} else {
					lastNibble = value;
					hasLastNibble = true;
				}
			} else {
				alert("'" + entered[i] + "' is not a valid hex digit");
				return;
			}
		}
		if (hasLastNibble) {
			result.push(lastNibble);
		}

		if (validator(result, bytes)) {
			for (var i = 0; i < bytes.length; ++i) { bytes[i] = result[i]; }
			while (bytes.length > result.length) { bytes.pop(); }
			for (var i = bytes.length; i < result.length; ++i) { bytes.push(result[i]); }
			refresh();
		} else {
			alert("invalid byte sequence entered");
		}
	}

	function addUpdateBytes(elm, message, bytes, validator) {
		$(elm).addEventListener('click', function(evt) {
			updateBytes(message, state[bytes], validator);
			evt.preventDefault();
		});
	}

	function validKeyLength(newArray) {
		return newArray.length >= 4;
	}

	addUpdateBytes('key', 'change key', 'key', validKeyLength);

	function sameLength(newArray, oldArray) { return newArray.length == oldArray.length; }

	addUpdateBytes('sbox', 'change S-Box', 'sbox', sameLength);
	addUpdateBytes('permute', 'change permutation', 'permute', sameLength);
	addUpdateBytes('input', 'change input', 'input', sameLength);
});