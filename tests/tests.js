'use strict';

var tests = {
	passed: 0,
	failed: []
};

tests['run'] = function(tsts) {
	if (! tsts) { return failed.length == 0; }

	if (tsts['setupOnce']) { tsts['setupOnce'](); }
	for (var key in tsts) {
  		if (key.startsWith('test')) {
  			var test = tsts[key];
  			if (typeof test == 'function') {
  				var context = {};
  				
  				if (tsts['setup']) { tsts['setup'](context); }

  				var error = null;
  				try {
 					test(context);
 				} catch(err) {
 					error = err;
 				}

 				if (! error) {
 					tests.passed += 1;
 				} else {
 					if (tsts['name']) { key = tsts['name'] + ': ' + key + ': ' + error; }
 					tests.failed.push(key);
 				}
 				if (tsts['teardown']) { tsts['teardown'](context); }
  			} else {
  				var oldName = test['name'];
  				test['name'] = tsts['name'] ? tsts['name'] + ': ' + key : key;
  				tests.run(test);
  				tsts.name = oldName;
  			}
  		}
	}

	if (tsts['teardownOnce']) { tsts['teardownOnce'](); }
}

tests['summary'] = function() {
	var failed = tests.failed.length > 0;
	var succeeded = ! failed && tests.passed > 0;
	var $cnt = document.getElementById('count');
	if ($cnt) {
		$cnt.appendChild(document.createTextNode((tests.failed.length + tests.passed)));
	}
	if (failed) {
		document.body.classList.add('failed');
		var $failedTests = document.getElementById('failed-tests');
		for (var i = 0; i < tests.failed.length; ++i) {
			var $li = document.createElement('li');
			$li.appendChild(document.createTextNode(tests.failed[i]));
			$failedTests.appendChild($li);
		}
	}
	if (succeeded) { document.body.classList.add('succeeded'); }
}

tests['assert'] = function(cond, msg) {
	if (! cond) {
		throw msg ? msg : 'assert failed';
	}
}

tests['assertEquals'] = function(a, b, msg) {
	if (a != b) {
		throw msg ? msg : a + ' is not equal to ' + b;
	}
}

tests['assertNull'] = function(obj, msg) {
	if (obj !== null) {
		throw msg ? msg : obj + ' is not null';
	}
}

tests['assertNotNull'] = function(obj, msg) {
	if (obj === null) {
		throw msg ? msg : 'null expected';
	}
}
