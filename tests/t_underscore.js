'use strict';

(function() {
	function makeFn(ctx) { return function(v, i) { ++ctx.count; ctx.valSum += v; ctx.idxSum += i; }; }

	function expectCtx(ctx, cnt, valSum, idxSum) {
		tests.assertEquals(cnt, ctx.count);
		tests.assertEquals(valSum, ctx.valSum);
		tests.assertEquals(idxSum, ctx.idxSum);
	}

	function square(x) { return x * x; }

	tests.run({
		name: 'underscore.js',
		testEach: {
			setup: function(ctx) { ctx['count'] = ctx['valSum'] = ctx['idxSum'] = 0; },
			testEmpty: function(ctx) {
				_.each([], makeFn(ctx));
				expectCtx(ctx, 0, 0, 0);
			},
			testNull: function(ctx) {
				_.each(null, makeFn(ctx));
				expectCtx(ctx, 0, 0, 0);
			},
			testSimple: function(ctx) {
				_.each([2, 4, 6, 8], makeFn(ctx));
				expectCtx(ctx, 4, 20, 6);				
			},
			testNonArray: function(ctx) {
				_.each(3, makeFn(ctx));
				expectCtx(ctx, 1, 3, 0);
			}
		},
		testEquals: {
			testEmpty: function() {
				tests.assert(_.equals([], []));
			},
			testSingleEqual: function() {
				tests.assert(_.equals([1], [1]));
			},
			testSingeNotEqual: function() {
				tests.assert(! _.equals([1], [2]));
			},
			testSimpleEquals: function() {
				tests.assert(_.equals([2, 3, 4], [2, 3, 4]));
			},
			testSimpleNotEquals: function() {
				tests.assert(! _.equals([2, 3, 4], [2, 2, 4]));
			},
			testFirstShorter: function() {
				tests.assert(! _.equals([2, 3], [2, 3, 4]));
			},
			testSecondShorter: function() {
				tests.assert(! _.equals([2, 3, 4], [2, 3]));
			},
			testBothNull: function() {
				tests.assert(_.equals(null, null));
			},
			testFirstNull: function() {
				tests.assert(! _.equals(null, []));
			},
			testsSecondNull: function() {
				tests.assert(! _.equals([], null));
			}
		},
		testMap: {
			testEmpty: function() {
				tests.assert(_.equals([], _.map([], square)));
			},
			testNull: function() {
				tests.assertNull(_.map(null, square));
			},
			testSimple: function() {
				tests.assert(_.equals([0, 1, 4, 9], _.map([0, 1, 2, 3], square)));
			},
			testSingle: function() {
				tests.assert(_.equals([16], _.map(4, square)));
			},
			testNonArray: function() {
				tests.assert(_.equals([9], _.map(3, square)));
			}
		}
	});
})();
