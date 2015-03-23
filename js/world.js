// https://secure.tibia.com/community/?subtopic=worlds&order=level_desc&world=Xantera

'use strict';

const elWorlds = document.getElementById('worlds');

if (elWorlds) {
	const cells = elWorlds.querySelectorAll('.table2 :-webkit-any(.Odd,.Even)');
	each(cells, function(element) {
		element.classList.add('mths-tibia-block-links');
	});
	cells[0].querySelector('a').focus();
}
