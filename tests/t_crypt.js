'use strict';

(function() {
    function test_case(tc) {
        return function () {
            tc.sbox = defaults.sbox;
            tc.permute = defaults.permute;
            tc.blockSize = defaults.blockSize;

            var key = expandKey(tc);
            var encrypted = encode_chain(tc, key);
            tests.assertEqualArrays(tc.encoded, encrypted, 'encrypting ' + tc.name);
            var decrypted = decode_chain(tc.encoded, tc, key);
            tests.assertEqualArrays(tc.input, decrypted, 'decrypting ' + tc.name);
        }
    }

    var tcs = { name: 'crypt.js' };
    _.each(testcases, function(tc, idx) {
        tcs['test' + idx] = test_case(tc);
    });
    tests.run(tcs);
})();
