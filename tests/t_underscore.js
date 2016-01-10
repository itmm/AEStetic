'use strict';

(function() {
	function makeFn(ctx) { return function(v, i) { ++ctx.count; ctx.valSum += v; ctx.idxSum += i; }; };

	function expectCtx(ctx, cnt, valSum, idxSum) {
		tests.assertEquals(cnt, ctx.count);
		tests.assertEquals(valSum, ctx.valSum);
		tests.assertEquals(idxSum, ctx.idxSum);
	}

	function square(x) { return x * x; };

	tests.run({
		name: 'underscore.js',
		testEach: {
			name: 'each',
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
			}
		},
		testEquals: {
			name: 'equals',
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
			}
		},
		testMap: {
			name: 'map',
			testEmpty: function() {
				tests.assert(_.equals([], _.map([], square)));
			},
			testNull: function() {
				tests.assertNull(_.map(null, square));
			},
			testSimple: function() {
				tests.assert(_.equals([0, 1, 4, 9], _.map([0, 1, 2, 3], square)));
			}
		}
	});
})();
