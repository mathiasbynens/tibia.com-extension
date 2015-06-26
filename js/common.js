'use strict';

const ORIGIN = location.hostname.includes('.test.') ?
	'https://secure.test.tibia.com' :
	'https://secure.tibia.com';
const XHR_TIMEOUT = 3000; // Abort XHR requests that take more than 3 seconds.

function encode(string) {
	// Poor man’s `encodeURIComponent`. We only ever pass input that matches
	// `/[A-Za-z ']/` anyway. Note that Tibia.com sometimes uses U+00A0 instead of
	// regular U+0020 spaces for some reason.
	return String(string).replace(/\x20|\xA0/g, '+');
}

// Very simple, Tibia.com-specific `decodeHTML` helper method. Don’t use this
// anywhere else; use `he.decode()` for proper HTML decoding. https://mths.be/he
function decodeHTML(string) {
	return string.replace(/&#160;/g, ' ');
}

function normalizeSpaces(text) {
	return text.replace(/\xA0/g, ' ');
}

// Strip tabs and newlines from the template literal.
function strip(callSite) {
	const args = [].slice.call(arguments, 1);
	const output = callSite.slice(0, args.length + 1).map(function(text, index) {
		return (index == 0 ? '' : args[index - 1]) + text;
	}).join('');
	return output.replace(/[\n\t]/g, '');
}

function each(array, callback) {
	const length = array.length;
	let index = -1;
	while (++index < length) {
		if (callback(array[index], index) === false) {
			break;
		}
	}
}

function getBuildingParams(name, separator) {
	for (const type in TIBIA_BUILDINGS) { // `type` is `'guildhalls'` or `'houses'`.
		for (const city in TIBIA_BUILDINGS[type]) {
			const id = TIBIA_BUILDINGS[type][city][name];
			if (id) {
				// `city` and `id` have been found.
				return `town=${ encode(city) }${ separator }houseid=${ encode(id) }`;
			}
		}
	}
}

// Rewrite internal HTTP links to their HTTPS equivalent.
each(
	document.querySelectorAll('a[href^="http://www.tibia.com/'),
	function(element) {
		element.protocol = 'https://';
		element.host = 'secure.tibia.com';
	}
);
each(
	document.querySelectorAll('a[href^="http://www.test.tibia.com/'),
	function(element) {
		element.protocol = 'https://';
		element.host = 'secure.test.tibia.com';
	}
);
// Do the same for forms that post to HTTP.
each(
	document.querySelectorAll('form[action^="http://www.tibia.com/'),
	function(element) {
		// Note: `element.action` is clobbered and points to `<input name=action>`.
		const url = new URL(element.getAttribute('action'));
		url.protocol = 'https:';
		url.hostname = 'secure.tibia.com';
		element.action = url;
	}
);
each(
	document.querySelectorAll('form[action^="http://www.test.tibia.com/'),
	function(element) {
		// Note: `element.action` is clobbered and points to `<input name=action>`.
		const url = new URL(element.getAttribute('action'));
		url.protocol = 'https:';
		url.hostname = 'secure.test.tibia.com';
		element.action = url;
	}
);

// Remove social media bullshit.
const elNetworkBox = document.getElementById('NetworksBox');
if (elNetworkBox) {
	elNetworkBox.parentNode.removeChild(elNetworkBox);
}
