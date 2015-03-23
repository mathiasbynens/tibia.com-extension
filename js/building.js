// https://secure.tibia.com/community/?subtopic=houses&page=view&world=Xantera&town=Liberty+Bay&houseid=64005
// https://secure.tibia.com/community/?subtopic=houses&page=view&world=Xantera&town=Thais&houseid=19007

(function() {

	var items = document.querySelectorAll('#houses b');
	if (!items.length) {
		return;
	}

	var surfaceArea = items[1].textContent;
	if (!surfaceArea.includes('square meter')) {
		return;
	}

	// If we made it this far, this is definitely a house or guildhall detail
	// page.

	var houseName = items[0].textContent;
	var world = items[3].textContent;

	// Normalize the URL in the address bar.
	var queryString = '?subtopic=houses&page=view&world=' + encode(world) +
		'&' + getBuildingParams(houseName, '&');
	if (!location.search.includes(queryString)) {
		history.replaceState({}, houseName, queryString);
	}

}());
