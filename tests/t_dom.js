'use strict';

(function() {
	//noinspection JSUnusedGlobalSymbols
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
				dom.addClass(null, 'test');
			},
			testAdd: function(ctx) {
				dom.addClass(ctx.obj, 'bla');
				tests.assertEquals('bla', ctx.obj.className);
			},
			testAddDouble: function(ctx) {
				dom.addClass(ctx.obj, 'bla');
				dom.addClass(ctx.obj, 'bla');
				tests.assertEquals('bla', ctx.obj.className);
			},
			testAddDifferent: function(ctx) {
				dom.addClass(ctx.obj, 'a');
				dom.addClass(ctx.obj, 'b');
				tests.assert(['a b', 'b a'].indexOf(ctx.obj.className) >= 0);
			}
		},
		testRemoveClass: {
			setup: function(ctx) {
				ctx['obj'] = document.createElement('div');
				dom.addClass(ctx['obj'], 'foo');
				dom.addClass(ctx['obj'], 'bar');
			},
			testNull: function() {
				dom.removeClass(null, 'foo');
			},
			testRemoveFirst: function(ctx) {
				dom.removeClass(ctx.obj, 'foo');
				tests.assertEquals('bar', ctx.obj.className);
			},
			testRemoveSecond: function(ctx) {
				dom.removeClass(ctx.obj, 'bar');
				tests.assertEquals('foo', ctx.obj.className);
			},
			testRemoveBoth: function(ctx) {
				dom.removeClass(ctx.obj, 'foo');
				dom.removeClass(ctx.obj, 'bar');
				tests.assertEquals('', ctx.obj.className);
			},
			testRemoveNonexisting: function(ctx) {
				dom.removeClass(ctx.obj, 'bla');
				tests.assert(['foo bar', 'bar foo'].indexOf(ctx.obj.className) >= 0);
			},
			testRemoveFromEmpty: function() {
				var obj = document.createElement('div');
				dom.removeClass(obj, 'bla');
				tests.assertEquals('', obj.className);
			}
		},
		testSetClass: {
			setup: function(ctx) {
				ctx['obj'] = document.createElement('div');
				dom.addClass(ctx['obj'], 'foo');
			},
			testAddNull: function() {
				dom.setClass(null, 'bar', true);
			},
			testRemoveVull: function() {
				dom.setClass(null, 'bar', false);
			},
			testAddExisting: function(ctx) {
				dom.setClass(ctx.obj, 'foo', true);
				tests.assertEquals('foo', ctx.obj.className);
			},
			testRemoveExisting: function(ctx) {
				dom.setClass(ctx.obj, 'foo', false);
				tests.assertEquals('', ctx.obj.className);
			},
			testAddNonExisting: function(ctx) {
				dom.setClass(ctx.obj, 'bar', true);
				tests.assert(['foo bar', 'bar foo'].indexOf(ctx.obj.className) >= 0);
			},
			testRemoveNoneExisting: function(ctx) {
				dom.setClass(ctx.obj, 'bar', false);
				tests.assertEquals('foo', ctx.obj.className);
			}
		}
	});
})();
