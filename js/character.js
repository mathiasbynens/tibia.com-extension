// https://secure.tibia.com/community/?subtopic=characters&name=Illja+Mythus

var elCharacters = document.getElementById('characters');

// Enhance the character info page.
if (elCharacters) {

	var currentTable;
	function $table(header, callback) {
		var tables = document.querySelectorAll('table');
		var result;
		each(tables, function(table) {
			if (table.querySelector('td').textContent == header) {
				return result = table;
			}
		});
		if (result) {
			currentTable = result;
			callback(currentTable);
		}
	}

	function $cell(header, callback) {
		// Cells contain U+00A0 instead of regular U+0020 spaces for some reason.
		header = header.replace(/\x20/g, '\xA0');
		var cells = currentTable.querySelectorAll('td');
		var nextCell;
		var text;
		each(cells, function(cell, index) {
			if (cell.textContent == (header + ':')) {
				nextCell = cells[++index];
				text = nextCell.textContent;
				return false; // break
			}
		});
		if (nextCell && callback) {
			var result = callback(nextCell, text);
			if (result != null) {
				nextCell.innerHTML = result;
			}
		}
		// This is a quick hack to make sure an `HTMLElement` is always returned.
		return nextCell || new Option;
	}

	function fetchOnlineCharacters(url) {
		return new Promise(function(resolve, reject) {
			var xhr = new XMLHttpRequest();
			xhr.open('get', url);
			xhr.timeout = XHR_TIMEOUT;
			xhr.onload = function() {
				if (this.status == 200) {
					resolve(this.responseText);
				} else {
					reject();
				}
			};
			xhr.onerror = function() {
				reject();
			};
			xhr.send();
		});
	}

	// Extract character names, levels, and vocations from HTML soup of the form:
	// https://secure.tibia.com/community/?subtopic=worlds&order=level_desc&world=Xantera
	function parseOnlineCharacters(html) {
		var regex = /<a href="http:\/\/www.tibia.com\/community\/\?subtopic=characters&name=(?:[^"&]+)" >([^<]+)<\/a><\/td><td style="width:10%;" >([0-9]+)<\/td><td style="width:20%;" >([^<]+)<\/td><\/tr>/g;
		var match;
		var map = {};
		while ((match = regex.exec(html))) {
			var name = decodeHTML(match[1]);
			var level = Number(match[2]);
			// Track vocation too, in case it changed since the character logged in.
			var vocation = decodeHTML(match[3]);
			map[name] = {
				'level': level,
				'vocation': vocation
			};
		}
		return map;
	}

	// Store a reference to all the player killers in the death list, for later.
	var killerAnchors;
	$table('Character Deaths', function(table) {
		killerAnchors = table.querySelectorAll('a');
	});

	// Improve the character information table.
	$table('Character Information', function() {

		var charCell;
		var charName;
		var charNameEncoded;
		$cell('Name', function(element, text) {
			// Account for “Foo, will be deleted at Oct 1 2012, 17:00:00 CEST”.
			charCell = element;
			charName = normalizeSpaces(text.match('^[^,]+')[0].trim());
			charNameEncoded = encode(charName);
			charCell.onclick = function(event) {
				var target = event.target;
				if (target.matches('.mths-tibia-character-name')) {
					var selection = window.getSelection();
					var range = new Range();
					range.selectNodeContents(target);
					selection.removeAllRanges();
					selection.addRange(range);
				}
			};
			return '<span class="mths-tibia-character-name">' + charName + '</span> <span style="font-size: 90%;">(' + [
				'PvP history'.link('http://www.tibiaring.com/char.php?lang=en&amp;c=' + charNameEncoded),
				'online time'.link('http://www.pskonejott.com/otc_display.php?character=' + charNameEncoded),
				'experience history'.link('http://mrthomsen.de/player/view/' + charName.replace(/\x20|\xA0/g, '%20'))
			].join(', ') + ')</span>';
		});
		charCell.querySelector('a').focus();

		var queryString = '?subtopic=characters&name=' + charNameEncoded;
		if (location.search.indexOf(queryString) == -1) {
			history.replaceState({}, charName, queryString);
		}

		// Store a reference to the vocation cell, for later.
		var vocation;
		var vocationCell;
		$cell('Vocation', function(element, text) {
			vocationCell = element;
			vocation = normalizeSpaces(text);
		});

		// Is the character married?
		$cell('Married to').classList.add('mths-tibia-block-links');

		// Get the character’s world name.
		var world;
		$cell('World', function(element, text) {
			world = text;
			element.classList.add('mths-tibia-block-links');
			return text.link(ORIGIN + '/community/?subtopic=worlds&amp;order=level_desc&amp;world=' + encode(text));
		});

		// Store a reference to the level cell, for later.
		var level;
		var levelCell;
		$cell('Level', function(element, text) {
			level = Number(text);
			levelCell = element;
		});

		fetchOnlineCharacters(
			'/community/?subtopic=worlds&order=level_desc&world=' + encode(world)
		).then(parseOnlineCharacters).then(function(map) {
			var entry = map[charName];
			// Update the level if it changed since the character’s last login.
			if (entry) {
				document.querySelector('.mths-tibia-character-name')
					.classList.add('mths-tibia-online');
				var delta = entry.level - level;
				if (delta) {
					levelCell.textContent = entry.level + ' (' + (delta < 0 ? '' : '+') + delta + ' since last login)';
					levelCell.classList.add('mths-tibia-online');
				}
			}
			// Update the vocation if it changed since the character’s last login.
			if (vocation != entry.vocation) {
				vocationCell.textContent = entry.vocation;
				vocationCell.classList.add('mths-tibia-online');
			}
			// Highlight online characters in the death list.
			each(killerAnchors, function(anchor) {
				var name = anchor.textContent.replace(/\xA0/g, ' ');
				var entry = map[name];
				if (entry) {
					anchor.classList.add('mths-tibia-online');
				}
			});
		});

		// Get the former world name (if any).
		$cell('Former World', function(element, text) {
			element.classList.add('mths-tibia-block-links');
			return text.link(ORIGIN + '/community/?subtopic=worlds&amp;order=level_desc&amp;world=' + encode(text));
		});

		// Link to the house detail page.
		$cell('House', function(element, text) {
			var city = text.match(/\(([^\)]+)\)\x20is/)[1];
			var houseName = text.match(/^(.+)\x20\([^\)]+\)\x20is/)[1];
			var houseID = TIBIA_BUILDINGS.houses[city][houseName];
			element.classList.add('mths-tibia-block-links');
			return text.link(ORIGIN + '/community/?subtopic=houses&amp;page=view&amp;world=' + encode(world) + '&amp;town=' + encode(city) + '&amp;houseid=' + encode(houseID));
		});

		// Append `onlyshowonline` query string parameter to the guild URL.
		$cell('Guild membership', function(element, text) {
			var anchor = element.querySelector('a');
			anchor.protocol = 'https://';
			anchor.host = 'secure.tibia.com';
			anchor.search += '&onlyshowonline=0';
		});
	});

	// Handle other characters on the account.
	$table('Characters', function(table) {
		var cells = table.querySelectorAll('td[width]:first-child');
		each(cells, function(cell) {
			var text = cell.textContent;
			var charName = text.match(/^\d+\.(?:\xA0|\x20)(.*)/)[1];
			cell.classList.add('mths-tibia-block-links');
			// `<nobr>`… I know! But that’s what they’re using:
			cell.innerHTML = '<nobr>' + text.link(ORIGIN + '/community/?subtopic=characters&amp;name=' + encode(charName)) + '</nobr>';
		});
	});

	// Make the character search form perform a clean GET.
	each(document.querySelectorAll('form[action="http://www.tibia.com/community/?subtopic=characters"]'), function(form) {
		form.method = 'get';
		var button = form.querySelector('input[name="Submit"]');
		if (button) {
			button.type = 'submit';
			button.removeAttribute('name');
		}
	});

}
