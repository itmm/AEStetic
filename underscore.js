
/*
	This file implements a subset of array processing functions like in the underscore or lodash
	library. As we don't need the full support of the library, only the needed functions are
	reimplemented with a modern browser in mind.
*/

var _ = {

	/*
		Invoke the function `fn` for each element of the array `ary`. `ary` can be `null`.
		`fn` will be invoked with the value and the current index.
	*/

	'each': function(ary, fn) {
		if (! ary || ! ary.length) { return; }
		var l = ary.length;
		for (var i = 0; i < l; ++i) { fn(ary[i], i); }
	},

	/*
		Compares two arrays, if the contain the same elements. This is a swallow comparison.
		Both arrays must not be `null`.
	*/

	'equals': function(a, b) {
		if (a.length != b.length) { return false; }
		for (var i = 0; i < a.length; ++i) {
			if (a[i] != b[i]) { return false; }
		}
		return true;			
	},

	/*
		Map currently changes `ary` by invoking `fn` with each element and updates the value
		with the result. Issue #51 addresses the mutation of the argument. The result array
		will be returned. `ary` can be `null`. `fn` will be invoked with the value and the
		current index.
	*/

	'map': function(ary, fn) {
		if (! ary || ! ary.length) { return ary; }
		var l = ary.length;
		for (var i = 0; i < l; ++i) { ary[i] = fn(ary[i], i); }
		return ary;
	}
};