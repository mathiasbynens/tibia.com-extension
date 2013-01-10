// Skip the annoying intro page
if (/^\/mmorpg\/free\-multiplayer\-online\-role\-playing\-game\.php/.test(location.pathname)) {
	location.href = 'http://www.tibia.com/news/?subtopic=latestnews';
	return;
}

var elCharacters = document.getElementById('characters');

// Enhance the character info page
if (elCharacters) {

	var currentTable;
	function $table(header, callback) {
		var tables = document.querySelectorAll('table');
		var result;
		each(tables, function(table) {
			if (table.querySelector('td').innerText == header) {
				return result = table;
			}
		});
		if (result) {
			currentTable = result;
			callback(currentTable);
		}
	}

	function $cell(header, callback) {
		var cells = currentTable.querySelectorAll('td');
		var nextCell;
		var text;
		each(cells, function(cell, index) {
			if (cell.innerText == (header + ':')) {
				nextCell = cells[++index];
				text = nextCell.innerText;
				return false; // break
			}
		});
		if (nextCell && callback) {
			return nextCell.innerHTML = callback(nextCell, text);
		}
		// Quick hack to make sure an `HTMLElement` is always returned
		return nextCell || new Option;
	}

	function encode(string) {
		return String(string).replace(/\x20|\xA0/g, '+');
	}

	function each(array, callback) {
		var index = -1;
		var length = array.length;
		while (++index < length) {
			if (callback(array[index], index) === false) {
				break;
			}
		}
	}


	// Apply Fitts’s Law: increase clickable area for some links
	var style = document.createElement('style');
	style.innerHTML = '.block-links a { display: block; }';
	document.head.appendChild(style);

	// Character information table
	$table('Character Information', function() {

		var charCell;
		var charName;
		var charNameEncoded;
		$cell('Name', function(element, text) {
			// Account for “Foo, will be deleted at Oct 1 2012, 17:00:00 CEST”
			charCell = element;
			charName = text.match('^[^,]+')[0];
			charNameEncoded = encode(charName);
			return charName + ' <span style="font-size: 90%;">(' + [
				'PvP history'.link('http://www.tibiaring.com/char.php?lang=en&c=' + charNameEncoded),
				'online time'.link('http://tibiafanstats.com/timecounter.php?player=' + charNameEncoded),
				'experience history'.link('http://tibiafanstats.com/xphist.php?player=' + charNameEncoded)
			].join(', ') + ')</span>';
		});
		charCell.querySelector('a').focus();

		var queryString = '?subtopic=characters&name=' + charNameEncoded;
		if (location.search.indexOf(queryString) == -1) {
			history.replaceState({}, charName, queryString);
		}

		// Married?
		$cell('Married to').classList.add('block-links');

		// World name
		var world;
		$cell('World', function(element, text) {
			world = text;
			element.classList.add('block-links');
			return text.link('http://www.tibia.com/community/?subtopic=worlds&amp;order=level_desc&amp;world=' + encode(text));
		});

		// Former world name (if any)
		$cell('Former World', function(element, text) {
			element.classList.add('block-links');
			return text.link('http://www.tibia.com/community/?subtopic=worlds&amp;order=level_desc&amp;world=' + encode(text));
		});

		// Link to House detail page
		$cell('House', function(element, text) {
			var city = text.match(/\(([^\)]+)\)\x20is/)[1];
			var houseName = text.match(/^(.+)\x20\([^\)]+\)\x20is/)[1];
			var houseID = buildings.houses[city][houseName];
			element.classList.add('block-links');
			return text.link('http://www.tibia.com/community/?subtopic=houses&amp;page=view&amp;world=' + encode(world) + '&amp;town=' + encode(city) + '&amp;houseid=' + encode(houseID));
		});

	});

	// Other characters on the account
	$table('Characters', function(table) {
		var cells = table.querySelectorAll('td[width]:first-child');
		each(cells, function(cell) {
			var text = cell.innerText;
			var charName = text.match(/^\d+\.(?:\xA0|\x20)(.*)/)[1];
			cell.classList.add('block-links');
			// `<nobr>`… I know! But that’s what they’re using:
			cell.innerHTML = '<nobr>' + text.link('http://www.tibia.com/community/?subtopic=characters&amp;name=' + encode(charName)) + '</nobr>';
		});
	});

	// Make the character search form perform a clean GET
	each(document.querySelectorAll('form[action="http://www.tibia.com/community/?subtopic=characters"]'), function(form) {
		form.method = 'get';
		var button = form.querySelector('input[name="Submit"]');
		if (button) {
			button.type = 'submit';
			button.removeAttribute('name');
		}
	});

	// Bookmarklets
	var bookmarklets = document.createElement('div');
	bookmarklets.innerHTML = '<br>Bookmarklets: <a href="data:text/html,<script>(function(){var%20q=prompt(\'Player%20name:\');if(q){document.location=\'http://www.tibia.com/community/?subtopic=characters&name=\'+q.replace(/%20/g,\'+\');}})();</script>">Player lookup</a>';
	elCharacters.querySelector('.Border_3 .BoxContent').appendChild(bookmarklets);
}

// Enhance the guild page
var guildContent = document.querySelector('#guilds .BoxContent');
if (guildContent) {
	guildContent.innerHTML = guildContent.innerHTML.replace(/Their home on ([a-zA-Z]+) is ([a-zA-Z\x20]+)./, function($0, $1, $2) {
		return $0.link('http://www.tibia.com/community/?subtopic=houses&amp;world=' + $1 + '&amp;page=view&amp;houseid=' + buildings.guildhalls[$2]);
	});
}