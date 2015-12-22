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
	
	state = {
		'sbox': defaults.sbox.slice(),
		'permute': defaults.permute.slice(),
		'key': defaults.key.slice(),
		'input': defaults.input.slice(),
		'rounds': defaults.rounds,
		'blockSize': defaults.blockSize
	};


// JavaScript helpers

	function equalArrays(a, b) {
		if (a.length != b.length) { return false; }
		for (var i = 0; i < a.length; ++i) {
			if (a[i] != b[i]) { return false; }
		}
		return true;
	}


// DOM manipulation

	function $(id) { return document.getElementById(id); }

	function setClass($elm, cls, set) {
		if (set) {
			$elm.classList.add(cls);
		} else {
			$elm.classList.remove(cls);
		}
	}

	function newTag(tag, id, classes) {
		var $elm = document.createElement(tag);
		if (id) $elm.setAttribute('id', id);
		if (classes) $elm.classNames = classes;
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

	function setTxt($elm, txt) {
		removeChilds($elm);
		$elm.appendChild(newTxt(txt));
		return $elm;
	}


// insert byte strings into DOM

	function formatByte(byte) {
		var formatted = byte.toString(16);
		return byte < 16 ? '0' + formatted : formatted;
	}

	function writeBytes($dest, ary, prefix) {
		var grouping = 8;
		var len = ary.length;

		removeChilds($dest);

		for (var i = 0; i < len; i += grouping) {
			var $div = newTag('div');
			for (var j = 0; j < grouping; ++j) {
				var k = i + j;
				appendChild($div, setTxt(newTag('span', prefix + k), formatByte(ary[k])), j > 0);
			}
			appendChild($dest, $div, i);
		}
	}


// handle state

	var is_rijndael = false;
	var is_aes128 = false;
	var is_aes192 = false;
	var is_aes256 = false;
	var is_testcase = false;

	function checkForKnownConfigurations() {
		is_rijndael = false;
		is_aes128 = false;
		is_aes192 = false;
		is_aes256 = false;
		is_testcase = false;

		if (equalArrays(state.sbox, defaults.sbox) && equalArrays(state.permute, defaults.permute)) {
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

						var isDefaultKey = equalArrays(state.key, defaults.key);
						var isDefaultInput = equalArrays(state.input, defaults.input);
						if (isDefaultKey && isDefaultInput) {
							is_testcase = true;
						}
					}
					break;
			}
		}		
	}

	function refreshState() {
		setTxt($('rounds-label'), state.rounds);
		setClass($('dec-rounds'), 'disabled', state.rounds <= 1);

		writeBytes($('sbox'), state.sbox, 'sbox-');
		writeBytes($('permute'), state.permute, 'permute-');
		writeBytes($('key'), state.key, 'key-');
		writeBytes($('input'), state.input, 'input-');

		checkForKnownConfigurations();
		setClass($('reference'), 'hidden', !is_testcase);
		setClass($('reference-bytes'), 'hidden', !is_testcase);
	}

	var $actives = [];

	function activate(ids) {
		for (var i = 0; i < $actives.length; ++i) {
			$actives[i].classList.remove('active');
		}
		$actives = [];
		for (var i = 0; i < ids.length; ++i) {
			var $obj = $(ids[i]);
			$actives.push($obj);
			$obj.classList.add('active');
		}
	}


	function refresh() {
		refreshState();

		function aes_mul(a, b) {
			var result = 0;
			while (a != 0)
			{
				if (a & 0x01) { result ^= b; }
				a >>= 1;
				b = (b << 1) ^ (b & 0x80? 0x1b: 0x00);
			}
			return result & 0xff;
		}


		var expanded_key = Array((state.rounds + 1) * state.blockSize);
		var i, j, k;

		var dependent = Array(expanded_key.length);
		for (i = 0; i < dependent.length; ++i) { dependent[i] = []; }
			
			for (i = 0; i < 32; ++i) {
				expanded_key[i] = state.key[i];
				dependent[i].push('key-' + i);
			}

			for (i = 32; i < expanded_key.length; i += 4) {
				for (j = 0; j < 4; ++j) {
					expanded_key[i + j] = expanded_key[i - 4 + j];
					dependent[i + j].push('expanded-key-' + (i - 4 + j));
				}

				if (i % 16 == 0) {
					if (i % 32 == 0) {
						k = expanded_key[i];
						var v = dependent[i];
						for (j = 0; j < 3; ++j) {
							expanded_key[i + j] = expanded_key[i + j + 1]; 
							dependent[i + j] = dependent[i + j + 1];
						}
						expanded_key[i + 3] = k;
						dependent[i + 3] = v;
					}
					for (j = 0; j < 4; ++j) { 
						dependent[i + j].push('sbox-' + expanded_key[i + j]);
						expanded_key[i + j] = state.sbox[expanded_key[i + j]]; 
					}
					if (i % 32 == 0) {
						expanded_key[i] ^= 1 << ((i/32 - 1) % 8);
					}
				}

				for (j = 0; j < 4; ++j) {
					expanded_key[i + j] ^= expanded_key[i + j - 32];
					dependent[i + j].push('expanded-key-' + (i + j - 32));
				}
			}

			function addDepends(id, deps) {
				var $obj = $(id);
				deps = deps.slice();
				deps.push(id);
				$obj.addEventListener('click', function(evt) {
					activate(deps);
					evt.preventDefault();
				});
			}
			writeBytes($('expanded-key'), expanded_key, 'expanded-key-');
			for (i = 0; i < expanded_key.length; ++i) {
				addDepends('expanded-key-' + i, dependent[i]);
			}

			var $computation = $('rounds'); var $computation_end = $('rounds-end');
			var $parent = $computation.parentNode;
			while ($computation.nextSibling != $computation_end) {
				$parent.removeChild($computation.nextSibling);
			}

			var block = Array(state.blockSize);
			var temp = Array(state.blockSize);
			dependent = Array(state.blockSize);
			for (i = 0; i < state.blockSize; ++i) {
				block[i] = state.input[i] ^ expanded_key[i];
				dependent[i] = ['input-' + i, 'expanded-key-' + i];
			}

			function add_tmp(name, block, prefix, $container) {
				var $li = newTag('li');
				$li.classList.add('table-view-cell');
				$li.appendChild(newTxt(name));
				$container.appendChild($li);
				var $d = newTag('li');
				$d.classList.add('table-view-cell');
				$d.classList.add('bytes');
				writeBytes($d, block, prefix);
				$container.appendChild($d);
			}

			for (var round = 1; round <= state.rounds; ++round) {
				var rnd = 'r-' + round;
				var $li = newTag('li');
				$li.classList.add('table-view-cell');
				$li.appendChild(newTxt('round ' + round));
				var $btn = newTag('button');
				$btn.classList.add('btn');
				var $spn = newTag('span');
				$spn.classList.add('icon');
				$spn.classList.add('icon-bars');
				$btn.appendChild($spn);
				$li.appendChild($btn);

				$parent.insertBefore($li, $computation_end);

				$li = newTag('li');
				$li.classList.add('table-view-cell');
				$li.classList.add('hidden');
				$parent.insertBefore($li, $computation_end);
				var $div = newTag('div');
				$div.classList.add('card');
				var $container = newTag('ul');
				$container.classList.add('table-view');
				$div.appendChild($container);
				$li.appendChild($div);

				(function($btn, $container) {
					$btn.addEventListener('click', function(evt) {
						toggleDiv(this, $container);
						evt.preventDefault();
					});
				})($btn, $li);

				for (i = 0; i < 16; ++i) {
					dependent[i].push('sbox-' + block[i]);
					block[i] = state.sbox[block[i]];
				}
				var rnd_sbox = rnd + '-sbox-';
				add_tmp('after S-Box:', block, rnd_sbox, $container);
				for (i = 0; i < 16; ++i) {
					addDepends(rnd_sbox + i, dependent[i]);
					dependent[i] = [rnd_sbox + i];
				}
				var dependent2 = Array(16);
				for (i = 0; i < 16; ++i) {
					temp[i] = block[state.permute[i]];
					dependent2[i] = dependent[state.permute[i]];
					dependent2[i].push('permute-' + i);
				}
				var rnd_permute = rnd + '-permute-';
				add_tmp('after permutation:', temp, rnd_permute, $container);
				for (i = 0; i < 16; ++i) {
					addDepends(rnd_permute + i, dependent2[i]);
					dependent[i] = [rnd_permute + i];
				}

				if (round < state.rounds) {
					for (j = 0; j < 4; ++j) {
						var s0 = temp[4 * j];
						var s1 = temp[4 * j + 1];
						var s2 = temp[4 * j + 2];
						var s3 = temp[4 * j + 3];

						temp[4 * j] = aes_mul(2, s0) ^ aes_mul(3, s1) ^ s2 ^ s3;
						temp[4 * j + 1] = s0 ^ aes_mul(2, s1) ^ aes_mul(3, s2) ^ s3;
						temp[4 * j + 2] = s0 ^ s1 ^ aes_mul(2, s2) ^ aes_mul(3, s3);
						temp[4 * j + 3] = aes_mul(3, s0) ^ s1 ^ s2 ^ aes_mul(2, s3);

						dependent2[4 * j] = [
						dependent[4 * j][0],
						dependent[4 * j + 1][0],
						dependent[4 * j + 2][0],
						dependent[4 * j + 3][0],
						];
						dependent2[4 * j + 1] = dependent2[4 * j];
						dependent2[4 * j + 2] = dependent2[4 * j];
						dependent2[4 * j + 3] = dependent2[4 * j];
					}
					var rnd_mult = rnd + '-mult-';
					add_tmp('after mult:', temp, rnd_mult, $container);
					for (i = 0; i < 16; ++i) {
						addDepends(rnd_mult + i, dependent2[i]);
						dependent[i] = [rnd_mult + i];
					}
				}

				for (i = 0; i < 16; ++i) {
					block[i] = temp[i] ^ expanded_key[16 * round + i];
					dependent[i].push('expanded-key-' + (16 * round + i));
				}
				var rnd_key = rnd + '-key-';
				add_tmp('after mix with key:', block, rnd_key, $container);
				for (i = 0; i < 16; ++i) {
					addDepends(rnd_key + i, dependent[i]);
					dependent[i] = [rnd_key + i];
				}
			}

			writeBytes($('output'), block, 'out-');


		// decode

		$computation = $('decode-rounds'); $computation_end = $('decode-rounds-end');
		$parent = $computation.parentNode;
		while ($computation.nextSibling != $computation_end) {
			$parent.removeChild($computation.nextSibling);
		}

		var dec = Array(state.blockSize);
		var inv_permute = Array(state.blockSize);
		var inv_sbox = Array(256);

		for (i = 0; i < state.blockSize; ++i) {
			inv_permute[state.permute[i]] = i;
		}
		for (i = 0; i < 256; ++i) {
			inv_sbox[state.sbox[i]] = i;
		}

		for (i = 0; i < state.blockSize; ++i) 
		{
			dec[i] = block[i] ^ expanded_key[state.rounds * state.blockSize + i];
			dependent[i] = ['out-' + i, 'expanded-key-' + (state.rounds * state.blockSize + i)];
		}

		for (i = state.rounds - 1; i >= 0; --i)
		{
			var rnd = 'd-' + (i + 1);
			var $li = newTag('li');
			$li.classList.add('table-view-cell');
			$li.appendChild(newTxt('round ' + (i + 1)));
			var $btn = newTag('button');
			$btn.classList.add('btn');
			var $spn = newTag('span');
			$spn.classList.add('icon');
			$spn.classList.add('icon-bars');
			$btn.appendChild($spn);
			$li.appendChild($btn);

			$parent.insertBefore($li, $computation_end);

			$li = newTag('li');
			$li.classList.add('table-view-cell');
			$li.classList.add('hidden');
			$parent.insertBefore($li, $computation_end);
			var $div = newTag('div');
			$div.classList.add('card');
			var $container = newTag('ul');
			$container.classList.add('table-view');
			$div.appendChild($container);
			$li.appendChild($div);

			(function($btn, $container) {
				$btn.addEventListener('click', function(evt) {
					toggleDiv(this, $container);
					evt.preventDefault();
				});
			})($btn, $li);

			var rnd_input = rnd + '-input-';
			add_tmp('input to round:', dec, rnd_input, $container);
			for (j = 0; j < 16; ++j) {
				addDepends(rnd_input + j, dependent[j]);
				dependent[j] = [rnd_input + j];
			}

			for (j = 0; j < state.blockSize; ++j) {
				temp[j] = dec[inv_permute[j]];
				dependent2[j] = dependent[inv_permute[j]];
				dependent2[j].push('permute-' + inv_permute[j]);
			}
			var rnd_permute = rnd + '-permute-';
			add_tmp('after permute:', temp, rnd_permute, $container);
			for (j = 0; j < state.blockSize; ++j) {
				addDepends(rnd_permute + j, dependent2[j]);
				dependent[j] = [rnd_permute + j];
			}

			for (j = 0; j < state.blockSize; ++j) {
				dec[j] = inv_sbox[temp[j]];
				dependent[j].push('sbox-' + inv_sbox[temp[j]]);
			}
			var rnd_sbox = rnd + '-sbox-';
			add_tmp('after S-Box:', dec, rnd_sbox, $container);
			for (j = 0; j < state.blockSize; ++j) {
				addDepends(rnd_sbox + j, dependent[j]);
				dependent[j] = [rnd_sbox + j];
			}

			for (j = 0; j < state.blockSize; ++j) {
				dec[j] ^= expanded_key[i * 16 + j];
				dependent[j].push('expanded-key-' + (i * 16 + j));
			}
			var rnd_key = rnd + '-key-';
			add_tmp('after mix with key:', dec, rnd_key, $container);
			for (j = 0; j < state.blockSize; ++j) {
				addDepends(rnd_key + j, dependent[j]);
				dependent[j] = [rnd_key + j];
			}

			if (i > 0) 
			{
				for (j = 0; j < 4; ++j)
				{
					s0 = dec[4 * j];
					s1 = dec[4 * j + 1];
					s2 = dec[4 * j + 2];
					s3 = dec[4 * j + 3];

					dec[4 * j] = aes_mul(0x0e, s0) ^ aes_mul(0x0b, s1) ^ 
					aes_mul(0x0d, s2) ^ aes_mul(0x09, s3);
					dec[4 * j + 1] = aes_mul(0x09, s0) ^ aes_mul(0x0e, s1) ^ 
					aes_mul(0x0b, s2) ^ aes_mul(0x0d, s3);
					dec[4 * j + 2] = aes_mul(0x0d, s0) ^ aes_mul(0x09, s1) ^ 
					aes_mul(0x0e, s2) ^ aes_mul(0x0b, s3);
					dec[4 * j + 3] = aes_mul(0x0b, s0) ^ aes_mul(0x0d, s1) ^ 
					aes_mul(0x09, s2) ^ aes_mul(0x0e, s3);

					dependent2[4 * j] = [
						dependent[4 * j][0],
						dependent[4 * j + 1][0],
						dependent[4 * j + 2][0],
						dependent[4 * j + 3][0]
					];
					dependent2[4 * j + 1] = dependent2[4 * j];
					dependent2[4 * j + 2] = dependent2[4 * j];
					dependent2[4 * j + 3] = dependent2[4 * j];
				}
				var rnd_mult = rnd + '-mult-';
				add_tmp('after mult:', dec, rnd_mult, $container);
				for (j = 0; j < state.blockSize; ++j) {
					addDepends(rnd_mult + j, dependent2[j]);
					dependent[j] = [rnd_mult + j];
				}
			}
		}

		writeBytes($('decoded'), dec, 'dec-');
		for (j = 0; j < state.blockSize; ++j) {
			addDepends('dec-' + j, dependent[j]);
		}
	}

	refresh();

	function toggleDiv($button, $div) {
		var $span = $button.lastChild;
		if ($span.classList.contains('icon-close')) {
			$span.classList.remove('icon-close');
			$span.classList.add('icon-bars');
			$div.classList.add('hidden');
		} else {
			$span.classList.remove('icon-bars');
			$span.classList.add('icon-close');
			$div.classList.remove('hidden');
		}
	}
	$('toggle-rounds').addEventListener('click', function(evt) {
		toggleDiv(this, $('rounds-config'));
	});
	$('toggle-sbox').addEventListener('click', function(evt) {
		toggleDiv(this, $('sbox'));
	});
	$('toggle-permute').addEventListener('click', function(evt) {
		toggleDiv(this, $('permute'));
	});
	$('toggle-expanded-key').addEventListener('click', function(evt) {
		toggleDiv(this, $('expanded-key'));
	});
	$('inc-rounds').addEventListener('click', function(evt) {
		state.rounds += 1;
		refresh();
		evt.preventDefault();
	});
	$('dec-rounds').addEventListener('click', function(evt) {
		if (state.rounds > 1) {
			state.rounds -= 1;
			refresh();
		}
		evt.preventDefault();
	})

	function updateBytes(message, bytes) {
		var current = '';
		for (var i = 0; i < bytes.length; ++i) {
			var val = bytes[i];
			var formatted = val < 16 ? '0' + val.toString(16) : val.toString(16);
			current += formatted;
		}
		var entered = prompt(message, current);
		if (entered.length == current.length) {
			for (var i = 0; i < bytes.length; ++i) {
				bytes[i] = parseInt(entered.substring(2 * i, 2 * i + 2), 16);
			}
		}
	}


// update parameters

	function addUpdateBytes(elm, message, bytes) {
		$(elm).addEventListener('click', function(evt) {
			updateBytes(message, bytes);
			refresh();
			evt.preventDefault();
		});
	}

	addUpdateBytes('key', 'change key', state.key);
	addUpdateBytes('sbox', 'change S-Box', state.sbox);
	addUpdateBytes('permute', 'change permutation', state.permute);
	addUpdateBytes('input', 'change input', state.input);
});