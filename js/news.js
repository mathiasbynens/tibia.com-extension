// https://secure.tibia.com/news/?subtopic=latestnews
// https://secure.test.tibia.com/news/?subtopic=latestnews

'use strict';

const extractDate = element =>
	new Date(element.textContent.replace(/\xA0/g, '\x20').slice(0, 11));

const getDateRange = function() {
	return new Promise(function(resolve, reject) {
		const newsHeadlineDates = document.querySelectorAll('.NewsHeadlineDate');
		const newsTickerDates = document.querySelectorAll('.NewsTickerDate');
		const headlineStartDate = extractDate(
			newsHeadlineDates[newsHeadlineDates.length - 1]
		);
		const headlineEndDate = extractDate(newsHeadlineDates[0]);
		const newsTickerStartDate = extractDate(
			newsTickerDates[newsTickerDates.length - 1]
		);
		const newsTickerEndDate = extractDate(newsTickerDates[0]);
		const startDate = headlineStartDate > newsTickerStartDate ?
			newsTickerStartDate :
			headlineStartDate;
		const endDate = headlineEndDate < newsTickerEndDate ?
			newsTickerEndDate :
			headlineEndDate;
		resolve({
			'startDate': startDate,
			'endDate': endDate
		});
	});
}

const fetchLog = function(dates) {
	return new Promise(function(resolve, reject) {
		const xhr = new XMLHttpRequest();
		xhr.open('post', '/news/?subtopic=newsarchive');
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
		const startDate = dates.startDate;
		const endDate = dates.endDate;
		const params = strip`filter_begin_day=${ startDate.getDate() }
			&filter_begin_month=${ startDate.getMonth() + 1 }
			&filter_begin_year=${ startDate.getFullYear() }
			&filter_end_day=${ endDate.getDate() }
			&filter_end_month=${ endDate.getMonth() + 1 }
			&filter_end_year=${ endDate.getFullYear() }
			&filter_ticker=ticker
			&filter_news=news
			&filter_cipsoft=cipsoft
			&filter_community=community
			&filter_development=development
			&filter_support=support
			&filter_technical=technical`;
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.send(params);
	});
};

const parseResponse = function(html) {
	const newsHeadlines = document.querySelectorAll('.NewsHeadlineText');
	let headlineIndex = 0;
	const newsTickers = document.querySelectorAll('.NewsTickerText');
	let tickerIndex = 0;
	const regex = /<small>(.+)<\/small><\/td>\s*<td><a href='http:\/\/www\.(?:test\.)?tibia\.com\/news\/\?subtopic=newsarchive&amp;id=([0-9]+)/g;
	let match;
	while ((match = regex.exec(html))) {
		if (
			headlineIndex >= newsHeadlines.length &&
			tickerIndex >= newsTickers.length
		) {
			break;
		}
		const type = match[1]; // 'News' or 'News Ticker'
		const id = match[2];
		const link = document.createElement('a');
		link.className = 'mths-tibia-news-permalink';
		link.href = `${ ORIGIN }/news/?subtopic=newsarchive&id=${ id }`;
		if (type == 'News' && headlineIndex < newsHeadlines.length) {
			// It’s a main news entry.
			link.classList.add('mths-tibia-news-main-permalink');
			const container = newsHeadlines[headlineIndex].parentElement;
			container.parentElement.appendChild(link);
			link.appendChild(container);
			++headlineIndex;
		} else if (tickerIndex < newsTickers.length) {
			// It’s a news ticker entry.
			link.classList.add('mths-tibia-news-ticker-permalink');
			const container = newsTickers[tickerIndex];
			container.parentElement.appendChild(link);
			link.appendChild(container);
			++tickerIndex;
		}
	}
};

const match = /[?&]id=([0-9]+)/.exec(location.search);
if (match) {
	const id = match[1];
	if (location.search.includes('&fbegind=')) {
		history.replaceState({}, '', `/news/?subtopic=newsarchive&id=${ id }`);
	}
} else if (document.getElementById('newsticker')) {
	getDateRange()
		.then(fetchLog)
		.then(parseResponse);
}

each(
	document.querySelectorAll(strip`
		a[href*="subtopic=newsarchive&id="]
		[href*="&fbegind="]
	`),
	function(element) {
		const match = /[?&]id=([0-9]+)/.exec(element.search);
		if (match) {
			const id = match[1];
			element.search = `?subtopic=newsarchive&id=${ id }`;
		}
	}
);
