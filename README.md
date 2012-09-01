# Tibia.com user script

This user script enhances [the character info pages on Tibia.com](http://www.tibia.com/community/?subtopic=character&name=Arthas+Midnight).

Tibia is a MMORPG I used to play a decade ago, so this script isn’t really that useful for me anymore (although I hope it is for others) — but at least it gave me an excuse to learn how to scrape sites using [PhantomJS](http://phantomjs.org/).

## What it does

The user script does a couple of things:

* It makes sure the URL displayed in the address bar is always a permalink to the character profile you’re currently viewing, so that you can always easily copy-paste a permalink to the active profile page. (When entering a character name on the website, it performs a `POST` request and the character name isn’t part of the URL. The user script fixes that too.)
* It makes the world name clickable — it points to the “who’s online?” list for that particular game world.
* It makes house names clickable _without_ introducing additional XHR requests (unlike other, similar user scripts). All house IDs are hardcoded into the user script. The link points to the detail page of the house in question.
* It increases the clickable area of these links; where applicable, the links will be as wide as the table cell they’re in.
* It puts the focus on the world name link, so it’s easy to move to the other relevant links using keyboard navigation.

## How it works

To generate a new version of `tibia.user.js`, simply run [`grunt`](https://github.com/cowboy/grunt):

```bash
grunt
```

This will perform the following steps:

1. Build a list of Tibian cities by scraping [the house overview page on Tibia.com](http://www.tibia.com/community/?subtopic=houses&world=Xantera) using PhantomJS.
2. Build a map of house names and IDs by scraping the house overview page for each Tibian city. Booya!
3. Concatenate the generated data together with the core of the user script, and write the result to `tibia.user.js`.

The first two steps are only really needed when new Tibian cities are added in an update. To run only the third step and re-use the scraped data from last time, run the `concat` task:

```bash
grunt concat
```
