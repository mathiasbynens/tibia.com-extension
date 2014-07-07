// ==UserScript==
// @name Tibia.com enhancer
// @description Enhance Tibia.com.
// @version <%= version %>
// @link http://mths.be/tibiauserjs
// @author Mathias Bynens <http://mathiasbynens.be/>
// @match http://*.tibia.com/*
// @match https://*.tibia.com/*
// ==/UserScript==

(function() {

var BUILDINGS = <%= buildings %>;

var START_PAGE_URL = 'http://www.tibia.com/news/?subtopic=latestnews';

function each(array, callback) {
	var index = -1;
	var length = array.length;
	while (++index < length) {
		if (callback(array[index], index) === false) {
			break;
		}
	}
}

// Skip the annoying intro page.
if (location.pathname.indexOf('free-multiplayer-online-role-playing-game.php') > -1) {
	location.href = START_PAGE_URL;
	return;
}

// Rewrite links to the annoying intro page.
each(document.querySelectorAll('a[href$="free-multiplayer-online-role-playing-game.php"]'), function(element) {
	element.href = START_PAGE_URL;
});

var elCharacters = document.getElementById('characters');

// Enhance the character info page.
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
		// This is a quick hack to make sure an `HTMLElement` is always returned.
		return nextCell || new Option;
	}

	function encode(string) {
		return String(string).replace(/\x20|\xA0/g, '+');
	}

	// Improve the character information table.
	$table('Character Information', function() {

		var charCell;
		var charName;
		var charNameEncoded;
		$cell('Name', function(element, text) {
			// Account for “Foo, will be deleted at Oct 1 2012, 17:00:00 CEST”.
			charCell = element;
			charName = text.match('^[^,]+')[0];
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
				'experience history'.link('http://tibiastat.com/?page=playerLookup&amp;search=' + charNameEncoded)
			].join(', ') + ')</span>';
		});
		charCell.querySelector('a').focus();

		var queryString = '?subtopic=characters&name=' + charNameEncoded;
		if (location.search.indexOf(queryString) == -1) {
			history.replaceState({}, charName, queryString);
		}

		// Is the character married?
		$cell('Married to').classList.add('block-links');

		// Get the character’s world name.
		var world;
		$cell('World', function(element, text) {
			world = text;
			element.classList.add('block-links');
			return text.link('/community/?subtopic=worlds&amp;order=level_desc&amp;world=' + encode(text));
		});

		// Get the former world name (if any).
		$cell('Former World', function(element, text) {
			element.classList.add('block-links');
			return text.link('/community/?subtopic=worlds&amp;order=level_desc&amp;world=' + encode(text));
		});

		// Link to the House detail page.
		$cell('House', function(element, text) {
			var city = text.match(/\(([^\)]+)\)\x20is/)[1];
			var houseName = text.match(/^(.+)\x20\([^\)]+\)\x20is/)[1];
			var houseID = BUILDINGS.houses[city][houseName];
			element.classList.add('block-links');
			return text.link('/community/?subtopic=houses&amp;page=view&amp;world=' + encode(world) + '&amp;town=' + encode(city) + '&amp;houseid=' + encode(houseID));
		});

	});

	// Handle other characters on the account.
	$table('Characters', function(table) {
		var cells = table.querySelectorAll('td[width]:first-child');
		each(cells, function(cell) {
			var text = cell.innerText;
			var charName = text.match(/^\d+\.(?:\xA0|\x20)(.*)/)[1];
			cell.classList.add('block-links');
			// `<nobr>`… I know! But that’s what they’re using:
			cell.innerHTML = '<nobr>' + text.link('/community/?subtopic=characters&amp;name=' + encode(charName)) + '</nobr>';
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

	// Bookmarklets.
	var bookmarklets = document.createElement('div');
	bookmarklets.innerHTML = '<br>Bookmarklets: <a href="data:text/html,<script>(function(){var%20q=prompt(\'Player%20name:\');if(q){document.location=\'http://www.tibia.com/community/?subtopic=characters&name=\'+q.replace(/%20/g,\'+\');}})();</script>">Player lookup</a>';
	elCharacters.querySelector('.Border_3 .BoxContent').appendChild(bookmarklets);
}

// Enhance the guild page.
var guildContent = document.querySelector('#guilds .BoxContent');
if (guildContent) {
	guildContent.innerHTML = guildContent.innerHTML.replace(/Their home on ([a-zA-Z]+) is ([a-zA-Z\x20,]+)./, function($0, $1, $2) {
		return $0.link('http://www.tibia.com/community/?subtopic=houses&amp;world=' + $1 + '&amp;page=view&amp;houseid=' + BUILDINGS.guildhalls[$2]);
	});
}

// Remove social media bullshit.
var elNetworkBox = document.getElementById('NetworksBox');
if (elNetworkBox) {
	elNetworkBox.parentNode.removeChild(elNetworkBox);
}

// Improve forum usability.
if (/forum(?:\.test)?\.tibia\.com$/.test(location.hostname)) {

	var regexThreadID = /^Thread\x20#/;
	var threadID = '';
	each(document.querySelectorAll('b'), function(el) {
		var text = el.innerText;
		if (regexThreadID.test(text)) {
			threadID = text.replace(regexThreadID, '');
			return false; // break
		}
	});

	each(document.querySelectorAll('a[name^="post"]'), function(el) {
		var postID = el.name.replace(/^post/, '');
		el.href = '/forum/?action=thread&threadid=' + threadID + '&postid=' + postID + '#post' + postID;
		el.innerHTML = '\xB6';
		el.className = 'permalink';
	});

}

// Insert some CSS.
var style = document.createElement('style');
style.innerHTML = [
	// Apply Fitts’s Law: increase clickable area for some links.
	'.block-links a { display: block; }',
	// Hide the Facebook login button as it’s a very bad idea to link accounts.
	'#FB_LoginButton { display: none; }',
	'.permalink { position: absolute; top: 5px; right: 5px; z-index: 1; }'
].join('');
document.head.appendChild(style);

}());
