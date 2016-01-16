'use strict';

var refresh;

window.addEventListener('load', function () {

	var state = {
		'sbox': defaults.sbox.slice(),
		'permute': defaults.permute.slice(),
		'key': testcases[0].key.slice(),
		'input': testcases[0].input.slice(),
		'rounds': testcases[0].rounds,
		'blockSize': defaults.blockSize
	};

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

		if (disables_count == 0 && _.equals(state.sbox, defaults.sbox) && _.equals(state.permute, defaults.permute)) {
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
		dom.setClass($badge, 'badge-aes256', is_aes256);
		dom.setClass($badge, 'badge-aes192', is_aes192);
		dom.setClass($badge, 'badge-aes128', is_aes128);
		dom.setClass($badge, 'badge-rijndael', is_rijndael && !(is_aes256 || is_aes192 || is_aes128));
		dom.setClass($badge, 'badge-unknown', !is_rijndael);
	}

	function refreshState() {
		setTxt($('rounds-label'), state.rounds);
		dom.setClass($('dec-rounds'), 'disabled', state.rounds <= 1);

		writeBytes($('sbox'), state.sbox, 'sbox-', false);
		writeBytes($('permute'), state.permute, 'permute-', false);
		writeBytes($('key'), state.key, 'key-', false);
		writeBytes($('input'), state.input, 'input-', false);

		checkForKnownConfigurations();

		dom.setClass($('reference'), 'hidden', usedTestcase == null);
		dom.setClass($('reference-bytes'), 'hidden', usedTestcase == null);
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




// recalculate fields

	refresh = function() {
		aes.relayout();
		aes.resetDependencies();
		refreshState();
		updateTestvectors();
		var expandedKey = expandKey(state);
		writeBytes($('expanded-key'), expandedKey, 'expanded-key-', true);
		var encoded = encode(state, expandedKey);
		decode(encoded, state, expandedKey);
	}

	refresh();


// toggle collapse/expand


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