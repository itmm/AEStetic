
/*
	This file implements a subset of array processing functions like in the underscore or lodash
	library. As we don't need the full support of the library, only the needed functions are
	reimplemented with a modern browser in mind.
*/

var _ = {

	/*
		Invoke the function `fn` for each element of the array `ary`.
		`fn` will be invoked with the value and the current index of each element.
		If  `ary` is `null`, `fn` wont be invoked.
		But if `ary` is not `null` and not an array, then `fn` will be invoked
		with `ary`. So a non-Array will be treated as an array with only one element.
	*/

	'each': function(ary, fn) {
		if (! ary) { return; }
		if (Array.isArray(ary)) {
			var l = ary.length;
			for (var i = 0; i < l; ++i) { fn(ary[i], i); }
		} else {
			fn(ary, 0);
		}
	},

	/*
		Compares two arrays, if the contain the same elements. This is a swallow comparison.
	*/

	'equals': function(a, b) {
		if (! a) { return ! b; }
		if (! b) { return false; }
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