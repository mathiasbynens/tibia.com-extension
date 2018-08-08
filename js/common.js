'use strict';

const ORIGIN = location.hostname.includes('.test.') ?
	'https://www.test.tibia.com' :
	'https://www.tibia.com';
const XHR_TIMEOUT = 3000; // Abort XHR requests that take more than 3 seconds.

// Create a placeholder object for values that are defined and re-used across
// `.js` files.
const GLOBALS = {};

// Poor man’s `encodeURIComponent`. We only ever pass input that matches
// `/[A-Za-z ']/` anyway. Note that Tibia.com sometimes uses U+00A0 instead of
// regular U+0020 spaces for some reason.
const encode = text => String(text).replace(/\x20|\xA0/g, '+');

// Replace Tibia.com’s weird U+00A0 spaces with regular U+0020 spaces.
const normalizeSpaces = text => text.replace(/\xA0/g, ' ');

// Replace Tibia.com’s numeric HTML character references for U+00A0 with a
// regular space. Don’t use this code anywhere else; use `he.decode()` for
// proper HTML decoding. https://mths.be/he
const decodeHTML = html => html.replace(/&#160;/g, ' ');

// Strip tabs and newlines from the template literal.
const strip = function(callSite, ...args) {
	const output = callSite.slice(0, args.length + 1).map((text, index) =>
		(index == 0 ? '' : args[index - 1]) + text
	).join('');
	return output.replace(/[\n\t]/g, '');
};

const each = function(array, callback) {
	const length = array.length;
	let index = -1;
	while (++index < length) {
		if (callback(array[index], index) === false) {
			break;
		}
	}
};

const getBuildingParams = function(name, separator) {
	for (const type in TIBIA_BUILDINGS) { // `type` is `'guildhalls'` or `'houses'`.
		for (const city in TIBIA_BUILDINGS[type]) {
			const id = TIBIA_BUILDINGS[type][city][name];
			if (id) {
				// `city` and `id` have been found.
				return `town=${ encode(city) }${ separator }houseid=${ encode(id) }`;
			}
		}
	}
};

// Rewrite internal HTTP links to their HTTPS equivalent.
each(
	document.querySelectorAll(
		'a[href^="http://www.tibia.com/"],' +
		'a[href^="http://forum.tibia.com/"]'
	),
	function(element) {
		element.protocol = 'https://';
		element.host = 'www.tibia.com';
	}
);
each(
	document.querySelectorAll('a[href^="http://www.test.tibia.com/'),
	function(element) {
		element.protocol = 'https://';
	}
);
// Do the same for forms that post to HTTP.
each(
	document.querySelectorAll(
		'form[action^="http://www.tibia.com/"],' +
		'form[action^="http://forum.tibia.com/"]'
	),
	function(element) {
		// Note: `element.action` is clobbered and points to `<input name=action>`.
		const url = new URL(element.getAttribute('action'));
		url.protocol = 'https:';
		url.hostname = 'www.tibia.com';
		element.action = url;
	}
);
each(
	document.querySelectorAll('form[action^="http://www.test.tibia.com/"]'),
	function(element) {
		// Note: `element.action` is clobbered and points to `<input name=action>`.
		const url = new URL(element.getAttribute('action'));
		url.protocol = 'https:';
		url.hostname = 'www.test.tibia.com';
		element.action = url;
	}
);

// Remove social media bullshit.
const elNetworkBox = document.getElementById('NetworksBox');
if (elNetworkBox) {
	elNetworkBox.parentNode.removeChild(elNetworkBox);
}
