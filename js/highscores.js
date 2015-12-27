// https://secure.tibia.com/community/?subtopic=highscores
// https://secure.tibia.com/community/?subtopic=highscores&world=Xantera

(() => {
	'use strict';

	const select = document.querySelector('select[name="world"]');
	const h2 = document.querySelector('h2');
	// If `h2` is `null`, then this might be the entry page; no world has been
	// selected yet. https://secure.tibia.com/community/?subtopic=highscores
	if (select && location.search.includes('subtopic=highscores') && h2) {
		const world = select.value;
		const list = document.querySelector('input[name="list"]').value;
		const queryString = `?subtopic=highscores&world=${ world }&list=${ list }`;
		const title = h2.textContent;
		if (!location.search.includes(queryString)) {
			history.replaceState({}, title, queryString);
		}
	}
})();
