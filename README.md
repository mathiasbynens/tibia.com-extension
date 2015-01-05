# “Enhance Tibia.com” browser extension

This browser extension improves the user experience on Tibia.com.

Tibia is a MMORPG I used to play a decade ago, so this script isn’t really that useful for me anymore (although I hope it is for others). This project started mostly as an excuse to learn how to scrape sites using [PhantomJS](http://phantomjs.org/) (see `tools/scrape.js`).

## Installation

* [Chrome extension](https://chrome.google.com/webstore/detail/tibiacom-enhancer/nffjdandbhengjofneamfibpichapjbb)
* [Opera add-on](https://addons.opera.com/en/extensions/details/tibiacom-enhancer/)

## Features

The extension does a couple of things all around the website:

* It skips [the annoying intro page on Tibia.com](https://secure.tibia.com/mmorpg/free-multiplayer-online-role-playing-game.php).
* It shows permanent links for news entries and individual forum posts.
* It ensures internal links use HTTPS (i.e. `https://secure.tibia.com/…`) rather than HTTP (i.e. `http://www.tibia.com/…`) wherever possible.
* On guild info pages ([example](https://secure.tibia.com/community/?subtopic=guilds&page=view&GuildName=Blood)), it makes any guild’s guildhall name clickable _without_ introducing additional XHR requests.

The extension enhances character info pages ([example](https://secure.tibia.com/community/?subtopic=characters&name=Illja+Mythus)) as follows:

* It adds links to the character’s PvP history, online time, and experience history as shown on third-party websites.
* It puts the focus on the first link in the character details table, so it’s easier to move to the other relevant links using keyboard navigation.
* Any character names that are that are currently online on the same world according to [the “Players Online” page](https://secure.tibia.com/community/?subtopic=worlds&order=level_desc&world=Xantera) are highlighted. Also, the level and vocation cells are updated and highlighted if they changed since the character’s last login.
* It makes the character name easily selectable for copy-pasting — just click once on the character name to select it.
* It makes the world name clickable — it points to the “who’s online?” list for that particular game world.
* It makes house names clickable _without_ introducing additional XHR requests (unlike other, similar extensions). All house IDs are hardcoded into the extension. The link points to the detail page of the house in question.
* It makes sure the URL displayed in the address bar is always a permalink to the character profile you’re currently viewing, so that you can always easily copy-paste a permalink to the active profile page. (When entering a character name on the website, it performs a `POST` request and the character name isn’t part of the URL. The extension fixes that too.)
