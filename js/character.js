// https://secure.tibia.com/community/?subtopic=characters&name=Illja+Mythus
// https://secure.tibia.com/community/?subtopic=characters&name=Himmelh%FCpferin

'use strict';

const elCharacters = document.getElementById('characters');

// Enhance the character info page.
if (elCharacters) {

	let currentTable;
	const $table = function(header, callback) {
		const tables = document.querySelectorAll('table');
		let result;
		each(tables, function(table) {
			if (table.querySelector('td').textContent == header) {
				result = table;
				return result;
			}
		});
		if (result) {
			currentTable = result;
			callback(currentTable);
		}
	};

	const $cell = function(header, callback) {
		const cells = currentTable.querySelectorAll('td');
		let nextCell;
		let text;
		each(cells, function(cell, index) {
			if (cell.textContent == (header + ':')) {
				nextCell = cells[++index];
				text = nextCell.textContent;
				return false; // break
			}
		});
		if (nextCell && callback) {
			const result = callback(nextCell, text);
			if (result != null) {
				nextCell.innerHTML = result;
			}
		}
		// This is a quick hack to make sure an `HTMLElement` is always returned.
		return nextCell || new Option;
	};

	const fetchOnlineCharacters = function(url) {
		return new Promise(function(resolve, reject) {
			// Can haz timeout in Fetch API? https://github.com/whatwg/fetch/issues/20
			const xhr = new XMLHttpRequest();
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
	};

	// Extract character names, levels, and vocations from HTML soup of the form:
	// https://secure.tibia.com/community/?subtopic=worlds&order=level_desc&world=Xantera
	const parseOnlineCharacters = function(html) {
		const regex = /<a href="https:\/\/secure.tibia.com\/community\/\?subtopic=characters&name=(?:[^"&]+)" >([^<]+)<\/a><\/td><td style="width:10%;" >([0-9]+)<\/td><td style="width:20%;" >([^<]+)<\/td><\/tr>/g;
		const map = {};
		let match;
		while ((match = regex.exec(html))) {
			const name = decodeHTML(match[1]);
			const level = Number(match[2]);
			// Track vocation too, in case it changed since the character logged in.
			const vocation = decodeHTML(match[3]);
			map[name] = {
				'level': level,
				'vocation': vocation
			};
		}
		return map;
	};

	// Store a reference to all the player killers in the death list, for later.
	let killerAnchors;
	$table('Character Deaths', function(table) {
		killerAnchors = table.querySelectorAll('a');
	});

	// Improve the character information table.
	$table('Character Information', function() {
		let charCell;
		let charName;
		let charNameEncoded;
		$cell('Name', function(element, text) {
			// Account for “Foo, will be deleted at Oct 1 2012, 17:00:00 CEST”.
			charCell = element;
			charName = normalizeSpaces(text.match('^[^,]+')[0].trim());
			charNameEncoded = encode(charName);
			charCell.onclick = function(event) {
				const target = event.target;
				if (target.matches('.mths-tibia-character-name')) {
					const selection = window.getSelection();
					const range = new Range();
					range.selectNodeContents(target);
					selection.removeAllRanges();
					selection.addRange(range);
				}
			};
			return strip`<span class="mths-tibia-character-name">${ charName }</span>
				${ ' ' }<span class="mths-tibia-character-links">(
					<a href="http://www.tibiaring.com/char.php?lang=en
						&amp;c=${ encodeURIComponent(charName) }">PvP history</a>,${ ' ' }
					<a href="http://www.pskonejott.com/otc_display.php
						?character=${ charNameEncoded }">online time</a>,${ ' ' }
					<a href="http://mrthomsen.de/player/view/
						${ charName.replace(/\x20|\xA0/g, '%20') }">experience history</a>
				)</span>`;
		});
		charCell.querySelector('a').focus();

		// Normalize the URL in the address bar.
		const param = charNameEncoded.replace(/[^\x20-\x7E]/g, function(symbol) {
			return '%' + symbol.charCodeAt().toString(16).toUpperCase();
		});
		const queryString = `?subtopic=characters&name=${ param }`;
		if (!location.search.includes(queryString)) {
			history.replaceState({}, charName, queryString);
		}

		// Store a reference to the vocation cell, for later.
		let vocation;
		let vocationCell;
		$cell('Vocation', function(element, text) {
			vocationCell = element;
			vocation = normalizeSpaces(text);
		});

		// Is the character married?
		$cell('Married to').classList.add('mths-tibia-block-links');

		// Get the character’s world name.
		let world;
		$cell('World', function(element, text) {
			world = text;
			element.classList.add('mths-tibia-block-links');
			return strip`<a href="${ ORIGIN }/community/?subtopic=worlds&amp;
				order=level_desc&amp;world=${ encode(text) }">${ text }</a>`;
		});

		// Store a reference to the level cell, for later.
		let level;
		let levelCell;
		$cell('Level', function(element, text) {
			level = Number(text);
			levelCell = element;
		});

		fetchOnlineCharacters(strip`
			/community/?subtopic=worlds&order=level_desc&world=${ encode(world) }
		`).then(parseOnlineCharacters).then(function(map) {
			const entry = map[charName];
			// Update the level if it changed since the character’s last login.
			if (entry) {
				document.querySelector('.mths-tibia-character-name')
					.classList.add('mths-tibia-online');
				const delta = entry.level - level;
				if (delta) {
					levelCell.textContent = entry.level + ' (' + (delta < 0 ? '' : '+') +
						delta + ' since last login)';
					levelCell.classList.add('mths-tibia-online');
				}
				// Update the vocation if it changed since the character’s last login.
				if (vocation != entry.vocation) {
					vocationCell.textContent = entry.vocation;
					vocationCell.classList.add('mths-tibia-online');
				}
			}
			// Highlight online characters in the death list.
			if (killerAnchors) {
				each(killerAnchors, function(anchor) {
					const name = anchor.textContent.replace(/\xA0/g, ' ');
					const entry = map[name];
					if (entry) {
						anchor.classList.add('mths-tibia-online');
					}
				});
			}
		});

		// Get the former world name (if any).
		$cell('Former World', function(element, text) {
			element.classList.add('mths-tibia-block-links');
			return strip`<a href="${ ORIGIN }/community/?subtopic=worlds&amp;
				order=level_desc&amp;world=${ encode(text) }">${ text }</a>`;
		});

		// Link to the house detail page.
		$cell('House', function(element, text) {
			const city = text.match(/\(([^\)]+)\)\x20is/)[1];
			const houseName = text.match(/^(.+)\x20\([^\)]+\)\x20is/)[1];
			const houseID = TIBIA_BUILDINGS.houses[city][houseName];
			element.classList.add('mths-tibia-block-links');
			return strip`<a href="${ ORIGIN }/community/?subtopic=houses&amp;
				page=view&amp;world=${ encode(world) }&amp;town=${ encode(city) }&amp;
				houseid=${ encode(houseID) }">${ text }</a>`;
		});

		// Append `onlyshowonline` query string parameter to the guild URL.
		// This one cell contains U+00A0 instead of a regular U+0020 space for some
		// reason.
		$cell('Guild\xA0membership', function(element, text) {
			const anchor = element.querySelector('a');
			anchor.protocol = 'https://';
			anchor.host = 'secure.tibia.com';
			anchor.search = anchor.search.replace(
				'&page=view',
				`&page=view&world=${ world }`
			) + '&onlyshowonline=0';
		});
	});

	// Handle other characters on the account.
	$table('Characters', function(table) {
		const cells = table.querySelectorAll('td[width]:first-child');
		each(cells, function(cell) {
			const text = cell.textContent;
			const charName = text.match(/^\d+\.(?:\xA0|\x20)(.*)/)[1];
			cell.classList.add('mths-tibia-block-links');
			// `<nobr>`… I know! But that’s what they’re using:
			cell.innerHTML = strip`<nobr><a href="${ ORIGIN }/community/?subtopic=
				characters&amp;name=${ encode(charName) }">${ text }</a></nobr>`;
		});
	});

	// Make the character search form perform a clean GET.
	each(
		document.querySelectorAll(
			'form[action="https://secure.tibia.com/community/?subtopic=characters"]'
		),
		function(form) {
			form.method = 'get';
			const button = form.querySelector('input[name="Submit"]');
			if (button) {
				button.type = 'submit';
				button.removeAttribute('name');
			}
		}
	);

}
