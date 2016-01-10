function mult(a, b) {
	var result = 0;
	while (a != 0) {
		if (a & 0x01) { result ^= b; }
		a >>= 1;
		b = (b << 1) ^ (b & 0x80? 0x1b: 0x00);
	}
	return result & 0xff;
}


function expandKey(state) {
	var expandedKey = Array((state.rounds + 1) * state.blockSize);

	_.each(state.key, function(key, i) {
		expandedKey[i] = key;
		var idx = 'expanded-key-' + i;
		addDependencies(idx, 'key-' + i);
		addCalculations(idx, "key[" + i + "]");
	});		

	var rcon = 1;
	var rconExp = 0;

	for (var i = state.key.length; i < expandedKey.length; i += 4) {
		for (var j = 0; j < 4; ++j) {
			var old = i - 4 + j;
			expandedKey[i + j] = expandedKey[old];
			var idx = 'expanded-key-' + (i + j);
			addDependencies(idx, 'expanded-key-' + old);
			addCalculations(idx,
				"cur ← " + fb(expandedKey[old]) + " = key[" + old + "]"
			);
		}

		if (i % state.key.length == 0) {
			var tempKey = expandedKey[i];
			for (j = 0; j < 3; ++j) {
				expandedKey[i + j] = expandedKey[i + j + 1]; 
			}
			expandedKey[i + 3] = tempKey;
			rotateDependencies('expanded-key-', i, i + 4);
			for (var j = 0; j < 4; ++j) { 
				var idx = i + j;
				var jdx = 'expanded-key-' + idx;
				addDependencies(jdx, 'sbox-' + expandedKey[idx]);
				expandedKey[idx] = state.sbox[expandedKey[idx]]; 
				addCalculations(jdx,
					"cur ← " + fb(expandedKey[idx]) + " = S-Box[cur]"
				);
			}

			addCalculations('expanded-key-' + i,
				"rcon ← " + fb(rcon) + " = 0x02 ^ " + rconExp
			);
			expandedKey[i] ^= rcon;
			addCalculations('expanded-key-' + i,
				"cur ← " + fb(expandedKey[i]) + " = cur ⊕ rcon"
			);
			rcon = mult(rcon, 2);
			++rconExp;
		} else if (state.key.length > 24 && i % state.key.length == 16) {
			for (var j = 0; j < 4; ++j) { 
				var idx = i + j;
				var jdx = 'expanded-key-' + idx;
				addDependencies(jdx, 'sbox-' + expandedKey[idx]);
				expandedKey[idx] = state.sbox[expandedKey[idx]]; 
				addCalculations(jdx,
					"cur ← " + fb(expandedKey[idx]) + " = S-Box[cur]"
				);
			}
		}

		for (var j = 0; j < 4; ++j) {
			var idx = i + j;
			var old = idx - state.key.length;
			var jdx = 'expanded-key-' + idx;
			expandedKey[idx] ^= expandedKey[old];
			addDependencies(jdx, 'expanded-key-' + old);
			addCalculations(jdx, [
				"old ← " + fb(expandedKey[old]) + " = key[" + old + "]",
				fb(expandedKey[idx]) + " = cur ⊕ old"
			]);
		}
	}

	return expandedKey;
}

