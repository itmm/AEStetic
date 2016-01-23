'use strict';

/*
	In this file the default configurations of AES and test vectors are defined. The default values
	can be changed by the user with the current exception of `defaults.blockSize` which is always
	16 bytes.

	The `defaults` variable contains the default values for Rijndael and AES ciphers. If they are
	changed, the resulting cipher is no longer Rijndael. This values are used to initialize the
	algorithm and to check the current settings against to see, if the current configuration conforms
	to the standard algorithm.
*/

var defaults = {

	/*
		The S-Box is a permutation of bytes. Every of the 256 possible values of a byte must occur
		exactly once.
	*/

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

	/*
		The permute array permutes all bytes of a block. The numbers 0 to `defaults.blockSize`
		must occur exactly once.
	*/

	'permute': [
		0x00, 0x05, 0x0a, 0x0f,  0x04, 0x09, 0x0e, 0x03,
		0x08, 0x0d, 0x02, 0x07,  0x0c, 0x01, 0x06, 0x0b
	],

	/*
		Number of bytes that are processed. This number determines the size of `defaults.permute`
		and the size of the extended key. Currently, this value cannot be changed.
	*/

	'blockSize': 16,

	/*
		mapping bytes to the number of set bits
	*/
	'colorRamp': [
		0, 1, 1, 2,  1, 2, 2, 3,  1, 2, 2, 3,  2, 3, 3, 4,
		1, 2, 2, 3,  2, 3, 3, 4,  2, 3, 3, 4,  3, 4, 4, 5,
		1, 2, 2, 3,  2, 3, 3, 4,  2, 3, 3, 4,  3, 4, 4, 5,
		2, 3, 3, 4,  3, 4, 4, 5,  3, 4, 4, 5,  4, 5, 5, 6,

		1, 2, 2, 3,  2, 3, 3, 4,  2, 3, 3, 4,  3, 4, 4, 5,
		2, 3, 3, 4,  3, 4, 4, 5,  3, 4, 4, 5,  4, 5, 5, 6,
		2, 3, 3, 4,  3, 4, 4, 5,  3, 4, 4, 5,  4, 5, 5, 6,
		3, 4, 4, 5,  4, 5, 5, 6,  5, 5, 5, 6,  5, 6, 6, 7,

		1, 2, 2, 3,  2, 3, 3, 4,  2, 3, 3, 4,  3, 4, 4, 5,
		2, 3, 3, 4,  3, 4, 4, 5,  3, 4, 4, 5,  4, 5, 5, 6,
		2, 3, 3, 4,  3, 4, 4, 5,  3, 4, 4, 5,  4, 5, 5, 6,
		3, 4, 4, 5,  4, 5, 5, 6,  5, 5, 5, 6,  5, 6, 6, 7,

		2, 3, 3, 4,  3, 4, 4, 5,  3, 4, 4, 5,  4, 5, 5, 6,
		3, 4, 4, 5,  4, 5, 5, 6,  5, 5, 5, 6,  5, 6, 6, 7,
		3, 4, 4, 5,  4, 5, 5, 6,  5, 5, 5, 6,  5, 6, 6, 7,
		4, 5, 5, 6,  5, 6, 6, 7,  6, 6, 6, 7,  6, 7, 7, 8
	]
};


/*
	The `testcases` is an array of settings that together with the `default` settings form
	configurations for which the expected encrypted values are documented. These are the proofs
	for the correct function of the algorithm.

	Currently we have one entry for each AES mode. So the entries are a quick way to choose the
	correct standard configurations. The values are documented in the original FIPS documentation.

	The first entry will be used on startup.
*/

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
		],
		colored: false
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
		],
		colored: false
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
		],
		colored: false
	}, {
		name: 'colored AES-128',
		key: [
			0x00, 0x00, 0x00, 0x00,  0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00,  0x00, 0x00, 0x00, 0x00
		],
		rounds: 10,
		input: [
			0x00, 0x00, 0x01, 0x01,  0x03, 0x03, 0x07, 0x07,
			0x0f, 0x0f, 0x1f, 0x1f,  0x3f, 0x3f, 0x7f, 0x7f
		],
		encoded: [
			0xc7, 0xd1, 0x24, 0x19,  0x48, 0x9e, 0x3b, 0x62,
			0x33, 0xa2, 0xc5, 0xa7,  0xf4, 0x56, 0x31, 0x72
		],
		colored: true
	}
];
