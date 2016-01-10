/*
	This file contains functions for manipulation the DOM.
*/

function $(id) { return document.getElementById(id); }

function addClass($elm, cls) {
	if ($elm && $elm.classList) { $elm.classList.add(cls); }
	return $elm;
}

function removeClass($elm, cls) {
	if ($elm && $elm.classList) { $elm.classList.remove(cls); }
	return $elm;
}

function setClass($elm, cls, set) {
	if (set) {
		return addClass($elm, cls);
	} else {
		return removeClass($elm, cls);
	}
}

function newTag(tag, id, classes) {
	var $elm = document.createElement(tag);
	if (id) { $elm.setAttribute('id', id); }
	_.each(classes, function(cls) { addClass($elm, cls); });
	return $elm;
}

function newTxt(txt) { return document.createTextNode(txt); }

function appendChild($parent, $child, addSpace) {
	if (addSpace) { $parent.appendChild(newTxt(' ')); }
	$parent.appendChild($child);
	return $parent;
}

function removeChilds($parent) {
	while ($parent.hasChildNodes()) { $parent.removeChild($parent.firstChild); }
	return $parent;
}

function removeBetween($from, $to) {
	var $parent = $from.parentNode;
	for (;;) {
		var $next = $from.nextSibling;
		if ($next == $to) { break; }
		$parent.removeChild($next);
	}
}

function setTxt($elm, txt) {
	return appendChild(removeChilds($elm), newTxt(txt));
}

function par(text) {
	return setTxt(newTag('p'), text);
}
function pars(texts) {
	return _.map(texts.slice(), par);
}

function absoluteBox($elm) {
	var box = $elm.getBoundingClientRect();
	return {
		left: box.left + window.scrollX,
		right: box.right + window.scrollX,
		top: box.top + window.scrollY,
		bottom: box.bottom + window.scrollY,
		width: box.width,
		height: box.height
	};
}

function center(box) {
	return { x: box.left + box.width/2, y: box.top + box.height/2 };
}

