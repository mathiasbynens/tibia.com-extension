// https://www.tibia.com/community/?subtopic=killstatistics
// https://www.tibia.com/community/?subtopic=killstatistics&world=Wintera

{
	'use strict';

	const select = document.querySelector('select[name="world"]');
	const table = document.querySelector('table[cellspacing="1"]');
	// If `table` is `null`, then this might be the entry page; no world has been
	// selected yet. https://www.tibia.com/community/?subtopic=killstatistics
	if (select && location.search.includes('subtopic=killstatistics') && table) {
		const world = select.value;
		const queryString = `?subtopic=killstatistics&world=${ world }`;
		if (!location.search.includes(queryString)) {
			history.replaceState({}, 'Kill statistics for ${ world }', queryString);
		}
	}
}
