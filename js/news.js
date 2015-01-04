function extractDate(element) {
	return new Date(element.textContent.replace(/\xA0/g, '\x20').slice(0, 11));
}

function getDateRange() {
	return new Promise(function(resolve, reject) {
		var newsHeadlineDates = document.querySelectorAll('.NewsHeadlineDate');
		var newsTickerDates = document.querySelectorAll('.NewsTickerDate');
		var headlineStartDate = extractDate(
			newsHeadlineDates[newsHeadlineDates.length - 1]
		);
		var headlineEndDate = extractDate(newsHeadlineDates[0]);
		var newsTickerStartDate = extractDate(
			newsTickerDates[newsTickerDates.length - 1]
		);
		var newsTickerEndDate = extractDate(newsTickerDates[0]);
		var startDate = headlineStartDate > newsTickerStartDate ?
			newsTickerStartDate :
			headlineStartDate;
		var endDate = headlineEndDate < newsTickerEndDate ?
			newsTickerEndDate :
			headlineEndDate;
		resolve({
			'startDate': startDate,
			'endDate': endDate
		});
	});
}

function fetchLog(dates) {
	return new Promise(function(resolve, reject) {
		var xhr = new XMLHttpRequest();
		xhr.open('post', '/news/?subtopic=newsarchive');
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
		var startDate = dates.startDate;
		var endDate = dates.endDate;
		var params = 'filter_begin_day=' + startDate.getDate() +
			'&filter_begin_month=' + (startDate.getMonth() + 1) +
			'&filter_begin_year=' + startDate.getFullYear() +
			'&filter_end_day=' + endDate.getDate() +
			'&filter_end_month=' + (endDate.getMonth() + 1) +
			'&filter_end_year=' + endDate.getFullYear() +
			'&filter_ticker=ticker' +
			'&filter_news=news' +
			'&filter_cipsoft=cipsoft' +
			'&filter_community=community' +
			'&filter_development=development' +
			'&filter_support=support' +
			'&filter_technical=technical';
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.send(params);
	});
}

function parseResponse(html) {
	var newsHeadlines = document.querySelectorAll('.NewsHeadlineText');
	var headlineIndex = 0;
	var newsTickers = document.querySelectorAll('.NewsTickerText');
	var tickerIndex = 0;
	var regex = /<small>(.+)<\/small><\/td>\s*<td><a href='http:\/\/www\.tibia\.com\/news\/\?subtopic=newsarchive&amp;id=([0-9]+)/g;
	var match;
	var container;
	while ((match = regex.exec(html))) {
		if (
			headlineIndex >= newsHeadlines.length &&
			tickerIndex >= newsTickers.length
		) {
			break;
		}
		var type = match[1]; // 'News' or 'News Ticker'
		var id = match[2];
		var link = document.createElement('a');
		link.className = 'mths-tibia-news-permalink';
		link.href = ORIGIN + '/news/?subtopic=newsarchive&id=' + id;
		if (type == 'News' && headlineIndex < newsHeadlines.length) {
			// It’s a main news entry.
			link.classList.add('mths-tibia-news-main-permalink');
			container = newsHeadlines[headlineIndex].parentElement;
			container.parentElement.appendChild(link);
			link.appendChild(container);
			++headlineIndex;
		} else if (tickerIndex < newsTickers.length) {
			// It’s a news ticker entry.
			link.classList.add('mths-tibia-news-ticker-permalink');
			container = newsTickers[tickerIndex];
			container.parentElement.appendChild(link);
			link.appendChild(container);
			++tickerIndex;
		}
	}
}

var match = /[?&]id=([0-9]+)/.exec(location.search);
if (match) {
	var id = match[1];
	if (location.search.indexOf('&fbegind=') > -1) {
		history.replaceState({}, '', '/news/?subtopic=newsarchive&id=' + id);
	}
} else if (document.getElementById('newsticker')) {
	getDateRange()
		.then(fetchLog)
		.then(parseResponse);
}

each(
	document.querySelectorAll(
		'a[href*="subtopic=newsarchive&id="]' +
		'[href*="&fbegind="]'
	),
	function(element) {
		var match = /[?&]id=([0-9]+)/.exec(element.search);
		if (match) {
			var id = match[1];
			element.search = '?subtopic=newsarchive&id=' + id;
		}
	}
);
