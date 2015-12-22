var state = null;

window.addEventListener('load', function () {
	'use strict';

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

	function equalArrays(a, b) {
		if (a.length != b.length) { return false; }
		for (var i = 0; i < a.length; ++i) {
			if (a[i] != b[i]) { return false; }
		}
		return true;
	}

	function $(id) { return document.getElementById(id); }

	function addClass($elm, cls) { $elm.classList.add(cls); }
	function removeClass($elm, cls) { $elm.classList.remove(cls); }
	function setClass($elm, cls, set) {
		if (set) {
			addClass($elm, cls);
		} else {
			removeClass($elm,cls);
		}
	}

	function newTag(tag) { return document.createElement(tag); }
	function newTxt(txt) { return document.createTextNode(txt); }
	function newSpc() { return newTxt(' '); }

	function appendChild($parent, $child, addSpace) {
		if (addSpace) { $parent.appendChild(newSpc()); }
		$parent.appendChild($child);
	}

	function removeChilds($parent) {
		while ($parent.hasChildNodes()) { $parent.removeChild($parent.lastChild); }
	}

	function writeBytes($dest, ary, prefix) {
		var len = ary.length;

		removeChilds($dest);

		for (var i = 0; i < len; i += 8) {
			var $div = newTag('div');
			for (var j = 0; j < 8; ++j) {
				var val = ary[i + j];
				var formatted = val < 16 ? '0' + val.toString(16) : val.toString(16);
				var $span = newTag('span');
				$span.setAttribute('id', prefix + (i + j));
				$span.appendChild(newTxt(formatted));

				appendChild($div, $span, j);
			}
			appendChild($dest, $div, i);
		}
	}

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
		'rounds': 14
	};
	
	state = {
		'sbox': defaults.sbox.slice(),
		'permute': defaults.permute.slice(),
		'key': defaults.key.slice(),
		'input': defaults.input.slice(),
		'rounds': defaults.rounds
	};

	var block_size = 16;

	function doEncrypt() {
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

		var $label = $('rounds-label');
		removeChilds($label);
		$label.appendChild(newTxt(state.rounds));

		setClass($('dec-rounds'), 'disabled', state.rounds <= 1);

		writeBytes($('sbox'), state.sbox, 'sbox-');
		writeBytes($('permute'), state.permute, 'permute-');
		writeBytes($('key'), state.key, 'key-');
		writeBytes($('input'), state.input, 'input-');

		var is_rijndael = false;
		var is_aes128 = false;
		var is_aes192 = false;
		var is_aes256 = false;
		var is_testcase = false;

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

						if (equalArrays(state.key, defaults.key) && equalArrays(state.input, defaults.input)) {
							is_testcase = true;
						}
					}
					break;
			}
		}
		setClass($('reference'), 'hidden', !is_testcase);
		setClass($('reference-bytes'), 'hidden', !is_testcase);

		var expanded_key = Array((state.rounds + 1) * block_size);
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

		var block = Array(16);
		var temp = Array(16);
		dependent = Array(16);
		for (i = 0; i < 16; ++i) {
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
	}

	doEncrypt();

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
		doEncrypt();
		evt.preventDefault();
	});
	$('dec-rounds').addEventListener('click', function(evt) {
		if (state.rounds > 1) {
			state.rounds -= 1;
			doEncrypt();
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

	$('key').addEventListener('click', function(evt) {
		updateBytes('change key', state.key);
		doEncrypt();
		evt.preventDefault();
	});
	$('sbox').addEventListener('click', function(evt) {
		updateBytes('change S-Box', state.sbox);
		doEncrypt();
		evt.preventDefault();
	});
	$('input').addEventListener('click', function(evt) {
		updateBytes('change input', state.input);
		doEncrypt();
		evt.preventDefault();
	});
});