const fs = require('fs');
const jsesc = require('jsesc');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Block image requests.
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    if (request.resourceType() === 'image') {
      request.abort();
    } else {
      request.continue();
    }
  });

  await page.goto('https://www.tibia.com/community/?subtopic=houses&world=Wintera');
  const cities = await page.evaluate(() => {
    const elements = document.querySelectorAll('input[type="radio"][name="town"]');
    const cities = [...elements].map(element => element.value);
    return cities;
  });

  async function fetchBuildings(city, type) {
    console.assert(type === 'houses' || type === 'guildhalls');
    const url = `https://www.tibia.com/community/?subtopic=houses&world=Wintera&type=${type}&town=${encodeURIComponent(city)}`;
    const page = await browser.newPage();
    await page.goto(url);
    const object = await page.evaluate(() => {
      const firstTable = document.querySelector('table');
      const cells = firstTable.querySelectorAll('tr:nth-child(n+3) > td:nth-child(4n+1)');
      const buildingsToIds = {};
      if (cells.length === 1) {
        return buildingsToIds;
      }
      let index = -1;
      while (++index < cells.length) {
        const houseName = cells[index].textContent.replace(/\xA0/g, '\x20');
        const houseID = (cells[++index].querySelector('input[name="houseid"]') || {}).value;
        buildingsToIds[houseName] = Number(houseID);
      }
      return buildingsToIds;
    });
    const buildings = new Map(Object.entries(object).sort((a, b) => {
      // Sort by building ID.
      return a[1] - b[1];
    }));
    return buildings;
  }

  const housesByCity = new Map();
  const guildhallsByCity = new Map();

  // TODO: parallelize all HTTP requests, assuming the tibia.com server
  // doesn’t block rapid requests.
  for (const city of cities) {
    const [houses, guildhalls] = await Promise.all([
      fetchBuildings(city, 'houses'),
      fetchBuildings(city, 'guildhalls'),
    ]);
    if (houses.size) housesByCity.set(city, houses);
    if (guildhalls.size) guildhallsByCity.set(city, guildhalls);
  }

  await browser.close();

  const escape = (map) => {
    return jsesc(map, {
      'compact': false,
    });
  };
  const output = `'use strict';\n\nconst TIBIA_HOUSES = ${ escape(housesByCity) };\n\nconst TIBIA_GUILDHALLS = ${ escape(guildhallsByCity) };\n`;
  // Write the data to a JS file.
  fs.writeFileSync('data/buildings.js', output);

})();
