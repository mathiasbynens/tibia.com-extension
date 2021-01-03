'use strict';

// Undo CipSoft’s overly aggressive caching on pages that need to be
// up-to-date, so that F5 works as expected.
chrome.webRequest.onBeforeSendHeaders.addListener(
	(details) => {
		const headers = details.requestHeaders || [];
		headers.push({
			name: 'Cache-Control',
			value: 'no-store, max-age=0',
		});
		return {
			requestHeaders: headers,
		};
	},
	// filters:
	{
		urls: [
			'https://www.tibia.com/charactertrade/*',
			'https://www.tibia.com/forum/*',
			'https://www.tibia.com/community/*',
		]
	},
	// extraInfoSpec:
	[
		'blocking',
		'requestHeaders',
		'extraHeaders',
	]
);
