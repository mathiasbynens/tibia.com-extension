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

	// Account for “Foo, will be deleted at Oct 1 2012, 17:00:00 CEST”
	var charName = $cell('Name').innerText.match('^[^,]+')[0];

	var queryString = '?subtopic=characters&name=' + encode(charName);
	if (location.search.indexOf(queryString) == -1) {
		history.replaceState({}, charName, queryString);
	}

	// Married?
	$cell('Married to').classList.add('block-links');

	// World name
	var world;
	var worldCell;
	$cell('World', function(element, text) {
		world = text;
		worldCell = element;
		element.classList.add('block-links');
		return text.link('http://www.tibia.com/community/?subtopic=worlds&amp;order=level_desc&amp;world=' + encode(text));
	});
	worldCell.querySelector('a').focus();

	// Link to House detail page
	$cell('House', function(element, text) {
		var city = text.match(/\(([^\)]+)\)/)[1];
		var houseName = text.match(/^(.+)\x20\(/)[1];
		var houseID = houses[city][houseName];
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
document.getElementById('characters').querySelector('.Border_3 .BoxContent').appendChild(bookmarklets);
