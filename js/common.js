const ORIGIN = 'https://secure.tibia.com';

function encode(string) {
	// Avoid `encodeURIComponent` since the host page doesn’t use UTF-8.
	// We only ever pass input that matches `/[A-Za-z ']/` anyway.
	// Note that Tibia.com sometimes uses U+00A0 instead of regular U+0020 spaces
	// for some reason.
	return String(string).replace(/\x20|\xA0/g, '+');
}

function each(array, callback) {
	var index = -1;
	var length = array.length;
	while (++index < length) {
		if (callback(array[index], index) === false) {
			break;
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
// Do the same for forms that post to HTTP.
each(
	document.querySelectorAll('form[action^="http://www.tibia.com/'),
	function(element) {
		var url = new URL(element.action);
		url.protocol = 'https:';
		url.hostname = 'secure.tibia.com';
		element.action = url;
	}
);

// Remove social media bullshit.
var elNetworkBox = document.getElementById('NetworksBox');
if (elNetworkBox) {
	elNetworkBox.parentNode.removeChild(elNetworkBox);
}
