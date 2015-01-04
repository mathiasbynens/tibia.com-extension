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

	// Improve the character information table.
	$table('Character Information', function() {

		var charCell;
		var charName;
		var charNameEncoded;
		$cell('Name', function(element, text) {
			// Account for “Foo, will be deleted at Oct 1 2012, 17:00:00 CEST”.
			charCell = element;
			charName = text.match('^[^,]+')[0].trim();
			charNameEncoded = encode(charName);
			charCell.onclick = function(event) {
				var target = event.target;
				if (target.matches('.character-name')) {
					var selection = window.getSelection();
					var range = new Range();
					range.selectNodeContents(target);
					selection.removeAllRanges();
					selection.addRange(range);
				}
			};
			return '<span class="character-name">' + charName + '</span> <span style="font-size: 90%;">(' + [
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

		// Is the character married?
		$cell('Married to').classList.add('mths-tibia-block-links');

		// Get the character’s world name.
		var world;
		$cell('World', function(element, text) {
			world = text;
			element.classList.add('block-links');
			return text.link(ORIGIN + '/community/?subtopic=worlds&amp;order=level_desc&amp;world=' + encode(text));
		});

		// Get the former world name (if any).
		$cell('Former World', function(element, text) {
			element.classList.add('block-links');
			return text.link(ORIGIN + '/community/?subtopic=worlds&amp;order=level_desc&amp;world=' + encode(text));
		});

		// Link to the House detail page.
		$cell('House', function(element, text) {
			var city = text.match(/\(([^\)]+)\)\x20is/)[1];
			var houseName = text.match(/^(.+)\x20\([^\)]+\)\x20is/)[1];
			var houseID = TIBIA_BUILDINGS.houses[city][houseName];
			element.classList.add('block-links');
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
