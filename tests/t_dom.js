'use strict';

(function() {
	tests.run({
		name: 'dom.js',
		test$: {
			testNull: function() {
				tests.assertNull($(null));
			},
			testExisting: function() {
				tests.assertNotNull($('count'));
			},
			testNonExisting: function() {
				tests.assertNull($('non-existing'));
			}
		},
		testAddClass: {
			setup: function(ctx) { ctx['obj'] = document.createElement('div'); },
			testNull: function() {
				addClass(null, 'test');
			},
			testAdd: function(ctx) {
				addClass(ctx.obj, 'bla');
				tests.assertEquals('bla', ctx.obj.className);
			},
			testAddDouble: function(ctx) {
				addClass(ctx.obj, 'bla');
				addClass(ctx.obj, 'bla');
				tests.assertEquals('bla', ctx.obj.className);
			},
			testAddDifferent: function(ctx) {
				addClass(ctx.obj, 'a');
				addClass(ctx.obj, 'b');
				tests.assert(ctx.obj.className == 'a b' || ctx.obj.className == 'b a');
			}
		},
		testRemoveClass: {
			setup: function(ctx) {
				ctx['obj'] = document.createElement('div');
				addClass(ctx['obj'], 'foo');
				addClass(ctx['obj'], 'bar');
			},
			testNull: function() {
				removeClass(null, 'foo');
			},
			testRemoveFirst: function(ctx) {
				removeClass(ctx.obj, 'foo');
				tests.assertEquals('bar', ctx.obj.className);
			},
			testRemoveSecond: function(ctx) {
				removeClass(ctx.obj, 'bar');
				tests.assertEquals('foo', ctx.obj.className);
			},
			testRemoveBoth: function(ctx) {
				removeClass(ctx.obj, 'foo');
				removeClass(ctx.obj, 'bar');
				tests.assertEquals('', ctx.obj.className);
			},
			testRemoveNonexisting: function(ctx) {
				removeClass(ctx.obj, 'bla');
				tests.assert(ctx.obj.className == 'foo bar' || ctx.obj.className == 'bar foo');
			},
			testRemoveFromEmpty: function() {
				var obj = document.createElement('div');
				removeClass(obj, 'bla');
				tests.assertEquals('', obj.className);
			}
		},
		testSetClass: {
			setup: function(ctx) {
				ctx['obj'] = document.createElement('div');
				addClass(ctx['obj'], 'foo');
			},
			testAddNull: function() {
				setClass(null, 'bar', true);
			},
			testRemoveVull: function() {
				setClass(null, 'bar', false);
			},
			testAddExisting: function(ctx) {
				setClass(ctx.obj, 'foo', true);
				tests.assertEquals('foo', ctx.obj.className);
			},
			testRemoveExisting: function(ctx) {
				setClass(ctx.obj, 'foo', false);
				tests.assertEquals('', ctx.obj.className);
			},
			testAddNonExisting: function(ctx) {
				setClass(ctx.obj, 'bar', true);
				tests.assert(ctx.obj.className == 'foo bar' || ctx.obj.className == 'bar foo');
			},
			testRemoveNoneExisting: function(ctx) {
				setClass(ctx.obj, 'bar', false);
				tests.assertEquals('foo', ctx.obj.className);
			}
		}
	});
})();
