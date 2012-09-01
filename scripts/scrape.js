(function() {

	var page = require('webpage').create();
	var fs = require('fs');

	function open(url, callback) {
		page.open(url, function(status) {
			if (status != 'success') {
				console.log('Network error.');
				return phantom.exit();
			}
			callback();
		});
	}

	// Get a list of all Tibian cities
	var cities;
	open('http://www.tibia.com/community/?subtopic=houses&world=Xantera', function() {
		cities = page.evaluate(function() {
			return [].map.call(document.querySelectorAll('input[type="radio"][name="town"]'), function(element) {
				return element.value;
			});
		});
		next();
	});

	var index = -1;
	function next() {
		var city = cities[++index];
		var result;
		if (city) {
			handleCity(city);
		} else {
			// All done
			result = JSON.stringify(map, null, '\t').replace(/\xA0/g, '\x20');
			// Save a JSON version, because why not?
			fs.write('data/data.json', result + '\n', 'w');
			fs.write('data/data.js', 'var houses = ' + result.replace(/\x27/g, '\\x27').replace(/\x22/g, '\x27') + ';\n', 'w');
			phantom.exit();
		}
	}

	var map = {};

	function handleCity(city) {
		var url = 'http://www.tibia.com/community/?subtopic=houses&world=Xantera&town=' + city;
		//console.log(url);
		open(url, function() {
			map[city] = page.evaluate(function() {
				var index = -1;
				var cells = document.querySelector('table').querySelectorAll('tr:nth-child(n+3) > td:nth-child(4n+1)');
				var houseName;
				var houseID;
				var object = {};
				while (++index < cells.length) {
					houseName = cells[index].innerText;
					houseID = (cells[++index].querySelector('input[name="houseid"]') || {}).value;
					object[houseName] = Number(houseID);
				}
				return object;
			});
			next();
		});
	}

}());
