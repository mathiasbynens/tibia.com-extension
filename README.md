# “Enhance Tibia.com” browser extension

This browser extension improves the user experience on Tibia.com.

Tibia is a MMORPG I used to play a decade ago, so this script isn’t really that useful for me anymore (although I hope it is for others). This project started mostly as an excuse to learn how to scrape sites using [PhantomJS](http://phantomjs.org/) (see `tools/scrape.js`).

## Installation

* [Chrome extension](https://chrome.google.com/webstore/detail/tibiacom-enhancer/nffjdandbhengjofneamfibpichapjbb)
* [Opera extension](https://addons.opera.com/en/extensions/details/tibiacom-enhancer/)

## Features

The extension does a couple of things:

* It skips [the annoying intro page on Tibia.com](https://secure.tibia.com/mmorpg/free-multiplayer-online-role-playing-game.php).
* It shows permanent links for news entries and individual forum posts.
* It ensures internal links use HTTPS (i.e. `https://secure.tibia.com/…`) rather than HTTP (i.e. `http://www.tibia.com/…`).
* For character info pages ([example](https://secure.tibia.com/community/?subtopic=characters&name=Illja+Mythus)), it makes sure the URL displayed in the address bar is always a permalink to the character profile you’re currently viewing, so that you can always easily copy-paste a permalink to the active profile page. (When entering a character name on the website, it performs a `POST` request and the character name isn’t part of the URL. The extension fixes that too.)
* On character info pages, it makes the world name clickable — it points to the “who’s online?” list for that particular game world.
* On character info pages, it makes house names clickable _without_ introducing additional XHR requests (unlike other, similar extensions). All house IDs are hardcoded into the extension. The link points to the detail page of the house in question.
* On character info pages, it increases the clickable area of these links; where applicable, the links will be as wide as the table cell they’re in.
* On character info pages, it puts the focus on the world name link, so it’s easier to move to the other relevant links using keyboard navigation.
* On guild info pages ([example](https://secure.tibia.com/community/?subtopic=guilds&page=view&GuildName=Blood)), it makes any guild’s guildhall name clickable _without_ introducing additional XHR requests.
