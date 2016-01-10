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


// DOM manipulation

	
// handle highlighting

	var dependencies = {};
	var calculations = {};
	var tappedCell = null;

	function processClosure(active, visited, depth, addActiveClass) {
		if (!active.length || depth > 10) return;

		var nextLevel = [];

		var className = "active-" + depth;
		_.each(active, function(obj) {
			if (visited.indexOf(obj) < 0) {
				_.each(dependencies[obj], function(val) { nextLevel.push(val); });
				visited.push(obj);
			}
			if (addActiveClass) {
				addClass($(obj), className);
			} else {
				removeClass($(obj), className);
			}
		});
		processClosure(nextLevel, visited, depth + 1, addActiveClass);
	}

	function repositionCalc() {
		var $calc = $('calc');
		if (tappedCell && $calc.firstChild) {
			var $box = $(tappedCell).getBoundingClientRect();
			if (! $box.width && ! $box.height) {
				processClosure([tappedCell], [], 1, false);
				tappedCell = null;
				removeChilds($calc);
				relayout();
			}
			calc.style['left'] = ($box.left + window.scrollX + $box.width + 4) + "px";
			calc.style['top'] = ($box.top + window.scrollY + $box.height + 4) + "px";
			removeClass($calc, 'hidden');
		} else {
			addClass($calc, 'hidden');
		}
	}

	function absoluteCenter(box) {
		return {
			x: box.left + box.width/2 + window.scrollX,
			y: box.top + box.height/2 + window.scrollY
		}
	}
	function newLine($from, $to) {
		var fromBox = $from.getBoundingClientRect();
		var toBox = $to.getBoundingClientRect();
		if (! fromBox.width || ! fromBox.height || ! toBox.width || ! toBox.height) {
			return null;
		}

		var fromCenter = absoluteCenter(fromBox);
		var toCenter = absoluteCenter(toBox);

		var x1, y1, x2, y2;
		if (Math.abs(fromCenter.x - toCenter.x) > Math.abs(fromCenter.y - toCenter.y)) {
			var slope = (toCenter.y - fromCenter.y)/(toCenter.x - fromCenter.x);
			if (fromCenter.x < toCenter.x) {
				x1 = fromBox.right + 1 + window.scrollX;
				x2 = toBox.left - 1 + window.scrollX;
			} else {
				x1 = fromBox.left - 1 + window.scrollX;
				x2 = toBox.right + 1 + window.scrollX;
			}
			y1 = fromCenter.y - slope * (fromCenter.x - x1);
			y2 = fromCenter.y - slope * (fromCenter.x - x2);
		} else {
			var slope = (toCenter.x - fromCenter.x)/(toCenter.y - fromCenter.y);
			if (fromCenter.y < toCenter.y) {
				y1 = fromBox.bottom + 1 + window.scrollY;
				y2 = toBox.top - 1 + window.scrollY;
			} else {
				y1 = fromBox.top - 1 + window.scrollY;
				y2 = toBox.bottom + 1 + window.scrollY;
			}
			x1 = fromCenter.x - slope * (fromCenter.y - y1);
			x2 = fromCenter.x - slope * (fromCenter.y - y2);
		}

		var $line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
	    $line.setAttribute('x1', x1);
	    $line.setAttribute('y1', y1);
	    $line.setAttribute('x2', x2);
	    $line.setAttribute('y2', y2);
	    $line.setAttribute('stroke', 'rgba(255, 0, 0, 0.3)');
	    $line.setAttribute('stroke-width', "1px");
	    return $line;
	}

	function updateConnections() {
		var $connections = $('connections');
		removeChilds($connections);
		if (tappedCell) {
			var $source = $(tappedCell);

			_.each(dependencies[tappedCell], function(destination) {
				var $destination = $(destination);
				var $line = newLine($source, $destination);
				if ($line) {
					$connections.appendChild($line);
				}
			});
		}
	}

	function relayout() {
		repositionCalc();
		updateConnections();
	}

	function doCellClick(evt) {
		if (tappedCell) { 
			processClosure([tappedCell], [], 1, false);
		}
		var id = this.getAttribute('id');
		if (id == tappedCell) {
			tappedCell = null;
		} else {
			tappedCell = id;
			processClosure([tappedCell], [], 1, true);
			var calc = $('calc');
			var msg = calculations[id];
			removeChilds(calc);
			_.each(msg, function(elm) { calc.appendChild(elm); });
		}
		relayout();
		evt.preventDefault();
	}

	function addDependency(key, id) {
		var val = dependencies[key];
		if (val == null) { val = []; dependencies[key] = val; }
		val.push(id);
	}

// insert byte strings into DOM

	function formatByte(byte) {
		var formatted = byte.toString(16);
		return byte < 16 ? '0' + formatted : formatted;
	}

	function fb(byte) {
		return '0x' + formatByte(byte);
	}

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


// expand key

	var expandedKey;

	function expandKey() {
		expandedKey = Array((state.rounds + 1) * state.blockSize);

		_.each(state.key, function(key, i) {
			expandedKey[i] = key;
			dependencies['expanded-key-' + i] = ['key-' + i];
			calculations['expanded-key-' + i] = pars([
				"key[" + i + "]"
			]);
		});		

		var rcon = 1;
		var rconExp = 0;

		for (var i = state.key.length; i < expandedKey.length; i += 4) {
			for (var j = 0; j < 4; ++j) {
				expandedKey[i + j] = expandedKey[i - 4 + j];
				addDependency('expanded-key-' + (i + j), 'expanded-key-' + (i - 4 + j));
				calculations['expanded-key-' + (i + j)] = pars([
					"cur ← " + fb(expandedKey[i + j - 4]) + " = key[" + (i + j - 4) + "]"
				]);
			}

			if (i % state.key.length == 0) {
				var tempKey = expandedKey[i];
				var tempDependent = dependencies['expanded-key-' + i];
				var tempCalculations = calculations['expanded-key-' + i];
				for (j = 0; j < 3; ++j) {
					expandedKey[i + j] = expandedKey[i + j + 1]; 
					dependencies['expanded-key-' + (i + j)] = dependencies['expanded-key-' + (i + j + 1)];
					calculations['expanded-key-' + (i + j)] = calculations['expanded-key-' + (i + j + 1)];
				}
				expandedKey[i + 3] = tempKey;
				dependencies['expanded-key-' + (i + 3)] = tempDependent;
				calculations['expanded-key-' + (i + 3)] = tempCalculations;

				for (var j = 0; j < 4; ++j) { 
					var idx = i + j;
					addDependency('expanded-key-' + idx, 'sbox-' + expandedKey[idx]);
					expandedKey[idx] = state.sbox[expandedKey[idx]]; 
					calculations['expanded-key-' + idx].push(par(
						"cur ← " + fb(expandedKey[idx]) + " = S-Box[cur]"
					));
				}

				calculations['expanded-key-' + i].push(par(
					"rcon ← " + fb(rcon) + " = 0x02 ^ " + rconExp
				));
				expandedKey[i] ^= rcon;
				calculations['expanded-key-' + i].push(par(
					"cur ← " + fb(expandedKey[i]) + " = cur ⊕ rcon"
				));
				rcon = mult(rcon, 2);
				++rconExp;
			} else if (state.key.length > 24 && i % state.key.length == 16) {
				for (var j = 0; j < 4; ++j) { 
					var idx = i + j;
					addDependency('expanded-key-' + idx, 'sbox-' + expandedKey[idx]);
					expandedKey[idx] = state.sbox[expandedKey[idx]]; 
					calculations['expanded-key-' + idx].push(par(
						"cur ← " + fb(expandedKey[idx]) + " = S-Box[cur]"
					));
				}
			}

			for (var j = 0; j < 4; ++j) {
				var idx = i + j;
				var old = idx - state.key.length;
				expandedKey[idx] ^= expandedKey[old];
				addDependency('expanded-key-' + idx, 'expanded-key-' + old);
				calculations['expanded-key-' + idx].push(par(
					"old ← " + fb(expandedKey[old]) + " = key[" + old + "]"
				));
				calculations['expanded-key-' + idx].push(par(
					fb(expandedKey[idx]) + " = cur ⊕ old"
				));

			}
		}

		writeBytes($('expanded-key'), expandedKey, 'expanded-key-', true);
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

	function mult(a, b) {
		var result = 0;
		while (a != 0) {
			if (a & 0x01) { result ^= b; }
			a >>= 1;
			b = (b << 1) ^ (b & 0x80? 0x1b: 0x00);
		}
		return result & 0xff;
	}

	function polyDependency(frm, to, i) {
		to[i] = [frm[i][0], frm[i + 1][0], frm[i + 2][0], frm[i + 3][0]];
		to[i + 1] = to[i];
		to[i + 2] = to[i];
		to[i + 3] = to[i];
	}

	function encode() {
		var $computation = $('rounds');
		var $computation_end = $('rounds-end');
		var $parent = $computation.parentNode;
		removeBetween($computation, $computation_end);

		var block = Array(state.blockSize);
		var block2 = Array(state.blockSize);

		var dependent = Array(state.blockSize);
		var dependent2 = Array(state.blockSize);

		block = _.map(block, function(_, i) {
			dependent[i] = ['input-' + i, 'expanded-key-' + i];
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
		for (var round = 1; round <= state.rounds; ++round) {
			var rnd = 'r-' + round;
			var $container = addRound(round, $parent, $computation_end, 'r-enc-' + round + '-', roundHeaderClasses, roundContentClasses);

			// sbox

			var rnd_sbox = rnd + '-sbox-';
			block = _.map(block, function(val, i) {
				dependent[i].push('sbox-' + val);
				dependencies[rnd_sbox + i] = dependent[i];
				dependent[i] = [rnd_sbox + i];
				calculations[rnd_sbox + i] = pars([
					fb(state.sbox[val]) + " = S-Box[" + fb(val) + "]"
				]);
				return state.sbox[val];				
			});
			addSubEntry('after S-Box:', block, rnd_sbox, $container, true);

			// permute

			var rnd_permute = rnd + '-permute-';
			block2 = _.map(block2, function(_, i) {
				dependent2[i] = dependent[state.permute[i]];
				dependent2[i].push('permute-' + i);
				dependencies[rnd_permute + i] = dependent2[i];
				var j = state.permute[i];
				calculations[rnd_permute + i] = pars([
					"i ← " + j + " = permute[" + i + "]",
					fb(block[j]) + " = block[" + j + "]"
				]);
				return block[j];
			});
			addSubEntry('after permutation:', block2, rnd_permute, $container, true);
			dependent = _.map(dependent, function(_, i) { return [rnd_permute + i]; });

			// mult

			if (round < state.rounds) {
				var rnd_mult = rnd + '-mult-';
				for (var j = 0; j < 4; ++j) {
					var s0 = block2[4 * j];
					var s1 = block2[4 * j + 1];
					var s2 = block2[4 * j + 2];
					var s3 = block2[4 * j + 3];

					var s02 = mult(2, s0);
					var s13 = mult(3, s1);
					var s02xs13 = s02 ^ s13;
					var s2xs3 = s2 ^ s3;
					block2[4 * j] = s02xs13 ^ s2xs3;

					var s12 = mult(2, s1);
					var s23 = mult(3, s2);
					var s0xs12 = s0 ^ s12;
					var s23xs3 = s23 ^ s3;
					block2[4 * j + 1] = s0xs12 ^ s23xs3;

					var s22 = mult(2, s2);
					var s33 = mult(3, s3);
					var s0xs1 = s0 ^ s1;
					var s22xs33 = s22 ^ s33;
					block2[4 * j + 2] = s0xs1 ^ s22xs33;

					var s32 = mult(2, s3);
					var s03 = mult(3, s0);
					var s03xs1 = s03 ^ s1;
					var s2xs32 = s2 ^ s32;
					block2[4 * j + 3] = s03xs1 ^ s2xs32;

					polyDependency(dependent, dependent2, 4 * j);

					var fbs0 = fb(s0);
					var fbs1 = fb(s1);
					var fbs2 = fb(s2);
					var fbs3 = fb(s3);
					calculations[rnd_mult + 4 * j] = pars([
						"s0 ← " + fb(s02) + " = 2 × " + fbs0,
						"s1 ← " + fb(s13) + " = 3 × " + fbs1,
						"a ← " + fb(s02xs13) + " = s0 ⊕ s1",
						"b ← " + fb(s2xs3) + " = " + fbs2 + " ⊕ " + fbs3,
						fb(block2[4 * j]) + " = a ⊕ b"
					]);
					calculations[rnd_mult + (4 * j + 1)] = pars([
						"s1 ← " + fb(s12) + " = 2 × " + fbs1,
						"s2 ← " + fb(s23) + " = 3 × " + fbs2,
						"a ← " + fb(s0xs12) + " = " + fbs0 + " ⊕ s1",
						"b ← " + fb(s23xs3) + " = s2 ⊕ " + fbs3,
						fb(block2[4 * j + 1]) + " = a ⊕ b"
					]);
					calculations[rnd_mult + (4 * j + 2)] = pars([
						"s2 ← " + fb(s22) + " = 2 × " + fbs2,
						"s3 ← " + fb(s33) + " = 3 × " + fbs3,
						"a ← " + fb(s0xs1) + " = " + fbs0 + " ⊕ " + fbs1,
						"b ← " + fb(s22xs33) + " = s2 ⊕ s3",
						fb(block2[4 * j + 2]) + " = a ⊕ b"
					]);
					calculations[rnd_mult + (4 * j + 3)] = pars([
						"s3 ← " + fb(s32) + " = 2 × " + fbs3,
						"s0 ← " + fb(s03) + " = 3 × " + fbs0,
						"a ← " + fb(s03xs1) + " = s0 ⊕ " + fbs1,
						"b ← " + fb(s2xs32) + " = " + fbs2 + " ⊕ s3",
						fb(block2[4 * j + 3]) + " = a ⊕ b"
					]);
				}
				_.each(dependent2, function(val, i) {
					dependencies[rnd_mult + i] = val;
					dependent[i] = [rnd_mult + i];
				});
				addSubEntry('after mult:', block2, rnd_mult, $container, true);
			}

			// mix key

			var rnd_subkey = rnd + '-subkey-';
			block = _.map(block, function(_, j) {
				dependencies[rnd_subkey + j] = ['expanded-key-' + j];
				var k = state.blockSize * round + j;
				calculations[rnd_subkey + j] = pars([
					"bs ← " + state.blockSize,
					"round ← " + round,
					"i ← " + j,
					"j ← " + k + " = bs × round + i",
					fb(expandedKey[k]) + " = key[j]"
				]);
				return expandedKey[k];
			});
			addSubEntry('used subkey:', block, rnd_subkey, $container, true);

			var rnd_key = rnd + '-key-';
			block = _.map(block, function(_, i) {
				dependent[i].push(rnd_subkey + i);
				var j = state.blockSize * round + i;
				dependent[i].push('expanded-key-' + j);
				dependencies[rnd_key + i] = dependent[i];
				calculations[rnd_key + i] = pars(
					[fb(block2[i] ^ expandedKey[j]) + " = " + fb(block2[i]) + " ⊕ " + fb(expandedKey[j])
				]);

				dependent[i] = [rnd_key + i];
				return block2[i] ^ expandedKey[j];
			});
			addSubEntry('after mix with key:', block, rnd_key, $container, true);
		}

		writeBytes($('output'), block, 'out-', true);
		_.each(dependent, function(val, i) { dependencies['out-' + i] = dependent[i]; });
		return block;
	}


// do decoding

	function decode(block) {
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
				dependencies[rnd_input + j] = val;
				calculations[rnd_input + j] = pars([
					fb(dec[j]) + " = block[" + j + "]"
				]);
				return [rnd_input + j];
			});
			addSubEntry('input to round:', dec, rnd_input, $container, true);

			// permute

			var rnd_permute = rnd + '-permute-';
			dec2 = _.map(dec2, function(_, j) {
				dependent2[j] = dependent[inv_permute[j]];
				dependent2[j].push('permute-' + inv_permute[j]);
				dependencies[rnd_permute + j] = dependent2[j];
				var k = inv_permute[j];
				calculations[rnd_permute + j] = pars([
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
				dependencies[rnd_sbox + j] = dependent[j];
				dependent[j] = [rnd_sbox + j];
				calculations[rnd_sbox + j] = pars([
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
				dependencies[rnd_subkey + j] = ['expanded-key-' + j];
				var k = state.blockSize * i + j;
				calculations[rnd_subkey + j] = pars([
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
				dependencies[rnd_key + j] = dependent[j];
				dependent[j] = [rnd_key + j];
				var k = i * state.blockSize + j;
				calculations[rnd_key + j] = pars(
					[fb(val ^ expandedKey[k]) + " = " + fb(val) + " ⊕ " + fb(expandedKey[k])
				]);
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

					calculations[rnd_mult + (4 * j)] = pars([
						"s0 ← " + fb(s0e) + " = 0x0e × " + fbs0,
						"s1 ← " + fb(s1b) + " = 0x0b × " + fbs1,
						"s2 ← " + fb(s2d) + " = 0x0d × " + fbs2,
						"s3 ← " + fb(s39) + " = 0x09 × " + fbs3,
						"a ← " + fb(s0exs1b) + " = s0 ⊕ s1",
						"b ← " + fb(s2dxs39) + " = s2 ⊕ s3",
						fb(dec[4 * j]) + " = a ⊕ b"
					]);
					calculations[rnd_mult + (4 * j + 1)] = pars([
						"s0 ← " + fb(s09) + " = 0x09 × " + fbs0,
						"s1 ← " + fb(s1e) + " = 0x0e × " + fbs1,
						"s2 ← " + fb(s2b) + " = 0x0b × " + fbs2,
						"s3 ← " + fb(s3d) + " = 0x0d × " + fbs3,
						"a ← " + fb(s09xs1e) + " = s0 ⊕ s1",
						"b ← " + fb(s2bxs3d) + " = s2 ⊕ s3",
						fb(dec[4 * j + 1]) + " = a ⊕ b"
					]);
					calculations[rnd_mult + (4 * j + 2)] = pars([
						"s0 ← " + fb(s0d) + " = 0x0d × " + fbs0,
						"s1 ← " + fb(s19) + " = 0x09 × " + fbs1,
						"s2 ← " + fb(s2e) + " = 0x0e × " + fbs2,
						"s3 ← " + fb(s3b) + " = 0x0b × " + fbs3,
						"a ← " + fb(s0dxs19) + " = s0 ⊕ s1",
						"b ← " + fb(s2exs3b) + " = s2 ⊕ s3",
						fb(dec[4 * j + 2]) + " = a ⊕ b"
					]);
					calculations[rnd_mult + (4 * j + 3)] = pars([
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
					dependencies[rnd_mult + k] = dependent2[k];
					return [rnd_mult + k];
				});
			}
		}

		writeBytes($('decoded'), dec, 'dec-', true);
		_.each(dependent, function(val, j) { dependencies['dec-' + j] = val; });
	}


// recalculate fields

	function refresh() {
		relayout();
		dependencies = {}; calculations = {};
		refreshState();
		updateTestvectors();
		expandKey();
		var encoded = encode();
		decode(encoded);
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