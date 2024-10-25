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
	const types = [TIBIA_GUILDHALLS, TIBIA_HOUSES];
	for (const type of types) {
		for (const [city, namesToIds] of type) {
			const id = namesToIds.get(name);
			if (id) {
				// `city` and `id` have been found.
				return `town=${ encode(city) }${ separator }houseid=${ encode(id) }`;
			}
		}
	}
};

const calculateLevelShareRange = (level) => {
	const min = Math.floor(level / 1.5);
	const max = Math.floor(level * 1.5 + 1);
	return {min, max};
};

const intFormatter = new Intl.NumberFormat('en');
const formatInt = (number) => formatter.format(number);

const euroFormatter = new Intl.NumberFormat('en', {
	style: 'currency',
	currency: 'EUR',
});
const formatEuro = (price) => euroFormatter.format(price);
