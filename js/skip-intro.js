// https://www.tibia.com/mmorpg/free-multiplayer-online-role-playing-game.php

{
	'use strict';

	const START_PAGE_URL = `${ ORIGIN }/news/?subtopic=latestnews`;

	// Skip the annoying intro page.
	if (location.pathname.includes('free-multiplayer-online-role-playing-game.php')) {
		location.href = START_PAGE_URL;
	}

	// Rewrite links to the annoying intro page.
	each(
		document.querySelectorAll(
			'a[href$="free-multiplayer-online-role-playing-game.php"]'
		),
		function(element) {
			element.href = START_PAGE_URL;
		}
	);
}
