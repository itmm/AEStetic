var state = null;

window.addEventListener('load', function () {
	'use strict';


// setup

	var defaults = {
		'sbox': [
			0x63, 0x7c, 0x77, 0x7b,  0xf2, 0x6b, 0x6f, 0xc5,
			0x30, 0x01, 0x67, 0x2b,  0xfe, 0xd7, 0xab, 0x76,
			0xca, 0x82, 0xc9, 0x7d,  0xfa, 0x59, 0x47, 0xf0,
			0xad, 0xd4, 0xa2, 0xaf,  0x9c, 0xa4, 0x72, 0xc0,
			0xb7, 0xfd, 0x93, 0x26,  0x36, 0x3f, 0xf7, 0xcc,
			0x34, 0xa5, 0xe5, 0xf1,  0x71, 0xd8, 0x31, 0x15,
			0x04, 0xc7, 0x23, 0xc3,  0x18, 0x96, 0x05, 0x9a,
			0x07, 0x12, 0x80, 0xe2,  0xeb, 0x27, 0xb2, 0x75,
			0x09, 0x83, 0x2c, 0x1a,  0x1b, 0x6e, 0x5a, 0xa0,
			0x52, 0x3b, 0xd6, 0xb3,  0x29, 0xe3, 0x2f, 0x84,
			0x53, 0xd1, 0x00, 0xed,  0x20, 0xfc, 0xb1, 0x5b,
			0x6a, 0xcb, 0xbe, 0x39,  0x4a, 0x4c, 0x58, 0xcf,
			0xd0, 0xef, 0xaa, 0xfb,  0x43, 0x4d, 0x33, 0x85,
			0x45, 0xf9, 0x02, 0x7f,  0x50, 0x3c, 0x9f, 0xa8,
			0x51, 0xa3, 0x40, 0x8f,  0x92, 0x9d, 0x38, 0xf5,
			0xbc, 0xb6, 0xda, 0x21,  0x10, 0xff, 0xf3, 0xd2,
			0xcd, 0x0c, 0x13, 0xec,  0x5f, 0x97, 0x44, 0x17,
			0xc4, 0xa7, 0x7e, 0x3d,  0x64, 0x5d, 0x19, 0x73,
			0x60, 0x81, 0x4f, 0xdc,  0x22, 0x2a, 0x90, 0x88,
			0x46, 0xee, 0xb8, 0x14,  0xde, 0x5e, 0x0b, 0xdb,
			0xe0, 0x32, 0x3a, 0x0a,  0x49, 0x06, 0x24, 0x5c,
			0xc2, 0xd3, 0xac, 0x62,  0x91, 0x95, 0xe4, 0x79,
			0xe7, 0xc8, 0x37, 0x6d,  0x8d, 0xd5, 0x4e, 0xa9,
			0x6c, 0x56, 0xf4, 0xea,  0x65, 0x7a, 0xae, 0x08,
			0xba, 0x78, 0x25, 0x2e,  0x1c, 0xa6, 0xb4, 0xc6,
			0xe8, 0xdd, 0x74, 0x1f,  0x4b, 0xbd, 0x8b, 0x8a,
			0x70, 0x3e, 0xb5, 0x66,  0x48, 0x03, 0xf6, 0x0e,
			0x61, 0x35, 0x57, 0xb9,  0x86, 0xc1, 0x1d, 0x9e,
			0xe1, 0xf8, 0x98, 0x11,  0x69, 0xd9, 0x8e, 0x94,
			0x9b, 0x1e, 0x87, 0xe9,  0xce, 0x55, 0x28, 0xdf,
			0x8c, 0xa1, 0x89, 0x0d,  0xbf, 0xe6, 0x42, 0x68,
			0x41, 0x99, 0x2d, 0x0f,  0xb0, 0x54, 0xbb, 0x16
		],
		'permute': [
			0x00, 0x05, 0x0a, 0x0f,  0x04, 0x09, 0x0e, 0x03,
			0x08, 0x0d, 0x02, 0x07,  0x0c, 0x01, 0x06, 0x0b
		],
		'key': [
			0x00, 0x01, 0x02, 0x03,  0x04, 0x05, 0x06, 0x07,
			0x08, 0x09, 0x0a, 0x0b,  0x0c, 0x0d, 0x0e, 0x0f,
			0x10, 0x11, 0x12, 0x13,  0x14, 0x15, 0x16, 0x17,
			0x18, 0x19, 0x1a, 0x1b,  0x1c, 0x1d, 0x1e, 0x1f
		],
		'input': [
			0x00, 0x11, 0x22, 0x33,  0x44, 0x55, 0x66, 0x77,
			0x88, 0x99, 0xaa, 0xbb,  0xcc, 0xdd, 0xee, 0xff
		],
		'rounds': 14,
		'blockSize': 16
	};
	

	var testcases = [
		{
			name: 'FIPS: AES-256',
			key: [
				0x00, 0x01, 0x02, 0x03,  0x04, 0x05, 0x06, 0x07,
				0x08, 0x09, 0x0a, 0x0b,  0x0c, 0x0d, 0x0e, 0x0f,
				0x10, 0x11, 0x12, 0x13,  0x14, 0x15, 0x16, 0x17,
				0x18, 0x19, 0x1a, 0x1b,  0x1c, 0x1d, 0x1e, 0x1f
			],
			rounds: 14,
			input: [
				0x00, 0x11, 0x22, 0x33,  0x44, 0x55, 0x66, 0x77,
				0x88, 0x99, 0xaa, 0xbb,  0xcc, 0xdd, 0xee, 0xff
			],
			encoded: [
				0x8e, 0xa2, 0xb7, 0xca,  0x51, 0x67, 0x45, 0xbf,
            	0xea, 0xfc, 0x49, 0x90,  0x4b, 0x49, 0x60, 0x89
			]
		}, {
			name: 'FIPS: AES-128',
			key: [
				0x00, 0x01, 0x02, 0x03,  0x04, 0x05, 0x06, 0x07,
				0x08, 0x09, 0x0a, 0x0b,  0x0c, 0x0d, 0x0e, 0x0f
			],
			rounds: 10,
			input: [
				0x00, 0x11, 0x22, 0x33,  0x44, 0x55, 0x66, 0x77,
				0x88, 0x99, 0xaa, 0xbb,  0xcc, 0xdd, 0xee, 0xff
			],
			encoded: [
				0x69, 0xc4, 0xe0, 0xd8,  0x6a, 0x7b, 0x04, 0x30,
				0xd8, 0xcd, 0xb7, 0x80,  0x70, 0xb4, 0xc5, 0x5a
			]
		}, {
			name: 'FIPS: AES-192',
			key: [
				0x00, 0x01, 0x02, 0x03,  0x04, 0x05, 0x06, 0x07,
				0x08, 0x09, 0x0a, 0x0b,  0x0c, 0x0d, 0x0e, 0x0f,
				0x10, 0x11, 0x12, 0x13,  0x14, 0x15, 0x16, 0x17
			],
			rounds: 12,
			input: [
				0x00, 0x11, 0x22, 0x33,  0x44, 0x55, 0x66, 0x77,
				0x88, 0x99, 0xaa, 0xbb,  0xcc, 0xdd, 0xee, 0xff
			],
			encoded: [
            	0xdd, 0xa9, 0x7c, 0xa4,  0x86, 0x4c, 0xdf, 0xe0,
            	0x6e, 0xaf, 0x70, 0xa0,  0xec, 0x0d, 0x71, 0x91
			]
		}
	];

	state = {
		'sbox': defaults.sbox.slice(),
		'permute': defaults.permute.slice(),
		'key': testcases[0].key.slice(),
		'input': testcases[0].input.slice(),
		'rounds': testcases[0].rounds,
		'blockSize': defaults.blockSize
	};


// underscore helpers

	var _ = {
		'each': function(ary, fn) {
			if (!ary || !ary.length) { return; }
			var l = ary.length;
			for (var i = 0; i < l; ++i) { fn(ary[i], i); }
		},
		'equals': function(a, b) {
			if (a.length != b.length) { return false; }
			for (var i = 0; i < a.length; ++i) {
				if (a[i] != b[i]) { return false; }
			}
			return true;			
		},
		'map': function(ary, fn) {
			if (!ary || !ary.length) { return; }
			var l = ary.length;
			for (var i = 0; i < l; ++i) { ary[i] = fn(ary[i], i); }
		}
	};


// DOM manipulation

	function $(id) { return document.getElementById(id); }

	function addClass($elm, cls) {
		if ($elm && $elm.classList) { $elm.classList.add(cls); }
	}

	function removeClass($elm, cls) {
		if ($elm && $elm.classList) { $elm.classList.remove(cls); }
	}

	function setClass($elm, cls, set) {
		if (set) {
			addClass($elm, cls);
		} else {
			removeClass($elm, cls);
		}
	}

	function newTag(tag, id, classes) {
		var $elm = document.createElement(tag);
		if (id) { $elm.setAttribute('id', id); }
		_.each(classes, function(cls) { addClass($elm, cls); });
		return $elm;
	}

	function newTxt(txt) { return document.createTextNode(txt); }
	function newSpc() { return newTxt(' '); }

	function appendChild($parent, $child, addSpace) {
		if (addSpace) { $parent.appendChild(newSpc()); }
		$parent.appendChild($child);
		return $parent;
	}

	function removeChilds($parent) {
		while ($parent.hasChildNodes()) { $parent.removeChild($parent.lastChild); }
	}

	function removeBetween($from, $to) {
		var $parent = $from.parentNode;
		for (;;) {
			var $next = $from.nextSibling;
			if ($next == $to) { break; }
			$parent.removeChild($next);
		}
	}

	function setTxt($elm, txt) {
		removeChilds($elm);
		$elm.appendChild(newTxt(txt));
		return $elm;
	}


// dismiss JavaScript error

	addClass($('no-javascript'), 'hidden');
	removeClass($('main'), 'hidden');


// handle highlighting

	var dependencies = {};
	var tappedCell = null;

	function processClosure(active, visited, depth, addActiveClass) {
		if (!active.length || depth > 3) return;

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
		}
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
		});		

		var rcon = 1;
		for (var i = state.key.length; i < expandedKey.length; i += 4) {
			for (var j = 0; j < 4; ++j) {
				expandedKey[i + j] = expandedKey[i - 4 + j];
				addDependency('expanded-key-' + (i + j), 'expanded-key-' + (i - 4 + j));
			}

			if (i % state.key.length == 0) {
				var tempKey = expandedKey[i];
				var tempDependent = dependencies['expanded-key-' + i];
				for (j = 0; j < 3; ++j) {
					expandedKey[i + j] = expandedKey[i + j + 1]; 
					dependencies['expanded-key-' + (i + j)] = dependencies['expanded-key-' + (i + j + 1)];
				}
				expandedKey[i + 3] = tempKey;
				dependencies['expanded-key-' + (i + 3)] = tempDependent;

				for (var j = 0; j < 4; ++j) { 
					var idx = i + j;
					addDependency('expanded-key-' + idx, 'sbox-' + expandedKey[idx]);
					expandedKey[idx] = state.sbox[expandedKey[idx]]; 
				}

				expandedKey[i] ^= rcon;
				rcon = mult(rcon, 2);
			} else if (state.key.length > 24 && i % state.key.length == 16) {
				for (var j = 0; j < 4; ++j) { 
					var idx = i + j;
					addDependency('expanded-key-' + idx, 'sbox-' + expandedKey[idx]);
					expandedKey[idx] = state.sbox[expandedKey[idx]]; 
				}
			}

			for (var j = 0; j < 4; ++j) {
				var idx = i + j;
				var old = idx - state.key.length;
				expandedKey[idx] ^= expandedKey[old];
				addDependency('expanded-key-' + idx, 'expanded-key-' + old);
			}
		}

		writeBytes($('expanded-key'), expandedKey, 'expanded-key-', true);
	}


// create table DOM elements

	function addRound(round, $parent, $before, prefix, headerClasses, contentClasses) {
		var $header = newTag('li', prefix + 'hdr', headerClasses);
		var $a = setTxt(newTag('a'), 'round ' + round);
		var $spn = newTag('span', null, ['icon-expand']);
		$a.appendChild($spn);
		$header.appendChild($a);
		$parent.insertBefore($header, $before);

		var $cell = newTag('li', prefix + 'cnt', contentClasses);
		$parent.insertBefore($cell, $before);
		var $div = newTag('div', null, ['card']);
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
		var $entry = newTag('li', null, ['referable']);
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

		_.map(block, function(_, i) {
			dependent[i] = ['input-' + i, 'expanded-key-' + i];
			return state.input[i] ^ expandedKey[i];
		});

		var roundHeaderClasses;
		var roundContentClasses;
		if ($('toggle-enc-label').classList.contains('icon-collapse')) {
			roundHeaderClasses = null;
			roundContentClasses = ['hidden'];

		} else {
			roundHeaderClasses = ['hidden'];
			roundContentClasses = ['hidden', 'hidden-2'];
		}
		for (var round = 1; round <= state.rounds; ++round) {
			var rnd = 'r-' + round;
			var $container = addRound(round, $parent, $computation_end, 'r-enc-' + round + '-', roundHeaderClasses, roundContentClasses);

			// sbox

			var rnd_sbox = rnd + '-sbox-';
			_.map(block, function(val, i) {
				dependent[i].push('sbox-' + val);
				dependencies[rnd_sbox + i] = dependent[i];
				dependent[i] = [rnd_sbox + i];
				return state.sbox[val];				
			});
			addSubEntry('after S-Box:', block, rnd_sbox, $container, true);

			// permute

			var rnd_permute = rnd + '-permute-';
			_.map(block2, function(_, i) {
				dependent2[i] = dependent[state.permute[i]];
				dependent2[i].push('permute-' + i);
				dependencies[rnd_permute + i] = dependent2[i];
				return block[state.permute[i]];
			});
			addSubEntry('after permutation:', block2, rnd_permute, $container, true);
			_.map(dependent, function(_, i) { return [rnd_permute + i]; });

			// mult

			if (round < state.rounds) {
				for (var j = 0; j < 4; ++j) {
					var s0 = block2[4 * j];
					var s1 = block2[4 * j + 1];
					var s2 = block2[4 * j + 2];
					var s3 = block2[4 * j + 3];

					block2[4 * j] = mult(2, s0) ^ mult(3, s1) ^ s2 ^ s3;
					block2[4 * j + 1] = s0 ^ mult(2, s1) ^ mult(3, s2) ^ s3;
					block2[4 * j + 2] = s0 ^ s1 ^ mult(2, s2) ^ mult(3, s3);
					block2[4 * j + 3] = mult(3, s0) ^ s1 ^ s2 ^ mult(2, s3);

					polyDependency(dependent, dependent2, 4 * j);
				}
				var rnd_mult = rnd + '-mult-';
				_.each(dependent2, function(val, i) {
					dependencies[rnd_mult + i] = val;
					dependent[i] = [rnd_mult + i];
				});
				addSubEntry('after mult:', block2, rnd_mult, $container, true);
			}

			// mix key

			var rnd_key = rnd + '-key-';
			_.map(block, function(_, i) {
				dependent[i].push('expanded-key-' + (state.blockSize * round + i));
				dependencies[rnd_key + i] = dependent[i];
				dependent[i] = [rnd_key + i];
				return block2[i] ^ expandedKey[state.blockSize * round + i];
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

		_.map(dec, function(_ ,i) {
			dependent[i] = ['out-' + i, 'expanded-key-' + (state.rounds * state.blockSize + i)];
			return block[i] ^ expandedKey[state.rounds * state.blockSize + i];
		});

		var roundHeaderClasses;
		var roundContentClasses;
		if ($('toggle-dec-label').classList.contains('icon-collapse')) {
			roundHeaderClasses = null;
			roundContentClasses = ['hidden'];

		} else {
			roundHeaderClasses = ['hidden'];
			roundContentClasses = ['hidden', 'hidden-2'];
		}
		for (var i = state.rounds - 1; i >= 0; --i) {
			var rnd = 'd-' + (i + 1);
			var $container = addRound(i + 1, $parent, $computation_end, 'r-dec-' + (i + 1) + '-', roundHeaderClasses, roundContentClasses);

			var rnd_input = rnd + '-input-';
			_.map(dependent, function(val, j) {
				dependencies[rnd_input + j] = val;
				return [rnd_input + j];
			});
			addSubEntry('input to round:', dec, rnd_input, $container, true);

			// permute

			var rnd_permute = rnd + '-permute-';
			_.map(dec2, function(_, j) {
				dependent2[j] = dependent[inv_permute[j]];
				dependent2[j].push('permute-' + inv_permute[j]);
				dependencies[rnd_permute + j] = dependent2[j];
				return dec[inv_permute[j]];
			});
			addSubEntry('after permute:', dec2, rnd_permute, $container, true);
			_.map(dependent, function(_, j) { return [rnd_permute + j]; });

			// sbox

			var rnd_sbox = rnd + '-sbox-';
			_.map(dec, function(_, j) {
				dependent[j].push('sbox-' + inv_sbox[dec2[j]]);
				dependencies[rnd_sbox + j] = dependent[j];
				dependent[j] = [rnd_sbox + j];
				return inv_sbox[dec2[j]];
			});
			addSubEntry('after S-Box:', dec, rnd_sbox, $container, true);

			// mix with key

			var rnd_key = rnd + '-key-';
			_.map(dec, function(val, j) {
				dependent[j].push('expanded-key-' + (i * state.blockSize + j));
				dependencies[rnd_key + j] = dependent[j];
				dependent[j] = [rnd_key + j];
				return val ^ expandedKey[i * state.blockSize + j];
			});
			addSubEntry('after mix with key:', dec, rnd_key, $container, true);

			// mult

			if (i > 0) {
				for (var j = 0; j < 4; ++j) {
					var s0 = dec[4 * j];
					var s1 = dec[4 * j + 1];
					var s2 = dec[4 * j + 2];
					var s3 = dec[4 * j + 3];

					dec[4 * j] = mult(0x0e, s0) ^ mult(0x0b, s1) ^ mult(0x0d, s2) ^ mult(0x09, s3);
					dec[4 * j + 1] = mult(0x09, s0) ^ mult(0x0e, s1) ^ mult(0x0b, s2) ^ mult(0x0d, s3);
					dec[4 * j + 2] = mult(0x0d, s0) ^ mult(0x09, s1) ^ mult(0x0e, s2) ^ mult(0x0b, s3);
					dec[4 * j + 3] = mult(0x0b, s0) ^ mult(0x0d, s1) ^ mult(0x09, s2) ^ mult(0x0e, s3);

					polyDependency(dependent, dependent2, 4 * j);
				}
				var rnd_mult = rnd + '-mult-';
				addSubEntry('after mult:', dec, rnd_mult, $container, true);
				_.map(dependent, function(_, k) {
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
		dependencies = {};
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
	}

	function addToggleDiv(a, divs, span) {
		_.map(divs, function(div) { return $(div); });
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

	function validKeyLength(newArray, _) {
		return newArray.length >= 4;
	}

	addUpdateBytes('key', 'change key', 'key', validKeyLength);

	function sameLength(newArray, oldArray) { return newArray.length == oldArray.length; }

	addUpdateBytes('sbox', 'change S-Box', 'sbox', sameLength);
	addUpdateBytes('permute', 'change permutation', 'permute', sameLength);
	addUpdateBytes('input', 'change input', 'input', sameLength);
});