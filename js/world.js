// https://secure.tibia.com/community/?subtopic=worlds&order=level_desc&world=Xantera

var elWorlds = document.getElementById('worlds');

if (elWorlds) {
	var cells = elWorlds.querySelectorAll('.table2 :-webkit-any(.Odd,.Even)');
	each(cells, function(element) {
		element.classList.add('mths-tibia-block-links');
	});
	cells[0].querySelector('a').focus();
}
