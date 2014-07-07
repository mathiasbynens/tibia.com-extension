(function() {

	var page = require('webpage').create();
	var fs = require('fs');
	var jsesc = require('jsesc');

	// Mask as a commonly used browser (in this case, Chrome 35 on Windows).
	page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML like Gecko) Chrome/35.0.1916.153 Safari/537.36';

	function open(url, callback) {
		page.open(url, function(status) {
			if (status != 'success') {
				console.log('Error loading ' + url);
				return phantom.exit();
			}
			callback();
		});
	}

	function extend(destination, source) {
		destination || (destination = {});
		for (var key in source) {
			// Note: there is no need to check `hasOwnProperty` in this case.
			destination[key] = source[key];
		}
	}

	// Get a list of all Tibian cities, and use it to build a list of items.
	var cities;
	var items = [];
	var map = { 'guildhalls': {}, 'houses': {} };
	open('http://www.tibia.com/community/?subtopic=houses&world=Xantera', function() {
		cities = page.evaluate(function() {
			return [].map.call(document.querySelectorAll('input[type="radio"][name="town"]'), function(element) {
				return element.value;
			});
		});
		cities.forEach(function(city) {
			var encodedCity = encodeURIComponent(city);
			items.push(
				{
					'url': 'http://www.tibia.com/community/?subtopic=houses&world=Xantera&type=houses&town=' + encodedCity,
					'type': 'houses',
					'city': city
				},
				{
					'url': 'http://www.tibia.com/community/?subtopic=houses&world=Xantera&type=guildhalls&town=' + encodedCity,
					'type': 'guildhalls',
					'city': city
				}
			);
			map.houses[city] = {};
		});
		next();
	});

	var index = -1;
	function next() {
		var item = items[++index];
		var result;
		if (item) {
			handleItem(item);
		} else {
			// All done.
			result = jsesc(map, {
				'json': true,
				'compact': false }
			) + '\n';
			// Save a JSON-formatted version of the data.
			fs.write('data/buildings.json', result, 'w');
			phantom.exit();
		}
	}

	function handleItem(item) {
		open(item.url, function() {
			var results = page.evaluate(function() {
				var index = -1;
				var cells = document.querySelector('table').querySelectorAll('tr:nth-child(n+3) > td:nth-child(4n+1)');
				var houseName;
				var houseID;
				var object = {};
				if (cells.length == 1) {
					return {};
				}
				while (++index < cells.length) {
					houseName = cells[index].textContent.replace(/\xA0/g, '\x20');
					houseID = (cells[++index].querySelector('input[name="houseid"]') || {}).value;
					object[houseName] = Number(houseID);
				}
				return object;
			});
			// Houses are grouped by city, but guildhalls aren’t.
			extend(item.type == 'houses' ? map[item.type][item.city] : map[item.type], results);
			// Some delay is needed to prevent the server from denying the request. :(
			setTimeout(next, 250);
		});
	}

}());
