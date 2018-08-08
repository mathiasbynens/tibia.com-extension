// https://www.tibia.com/community/?subtopic=worlds
// https://www.tibia.com/community/?subtopic=worlds&order=level_desc&world=Wintera

{
	'use strict';

	const elWorlds = document.getElementById('worlds');
	const titleElement = document.querySelector('.Text');
	const isWorldDetailPage = (
		elWorlds &&
		titleElement &&
		titleElement.textContent == 'World Selection'
		// If the title is some other value, then this might be the entry page; no
		// world has been selected yet.
		// https://www.tibia.com/community/?subtopic=worlds
	);

	if (isWorldDetailPage) {
		const cells = elWorlds.querySelectorAll('.Table2 :-webkit-any(.Odd,.Even)');
		each(cells, function(element) {
			element.classList.add('mths-tibia-block-links');
		});
		cells[0].querySelector('a').focus();
	}
}
