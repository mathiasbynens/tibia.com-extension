// https://www.tibia.com/charactertrade/?subtopic=currentcharactertrades
// https://www.tibia.com/charactertrade/?subtopic=currentcharactertrades&page=details&auctionid=6800&source=overview
// https://www.tibia.com/charactertrade/?subtopic=pastcharactertrades&page=details&auctionid=3592&source=overview
// https://www.tibia.com/charactertrade/?page=details&auctionid=6800

'use strict';

const elTibiaCoins = document.querySelectorAll('.ShortAuctionDataValue b');

// 1 TC = 0.03765 EUR
const TIBIA_COIN_COST_IN_EUR = 0.03765;

// Enhance the auction page.
if (elTibiaCoins) {
	for (const el of elTibiaCoins) {
		const costInCoins = el.textContent.replaceAll(',', '');
		const costInEur = costInCoins * TIBIA_COIN_COST_IN_EUR;
		el.title = `≈ ${ formatEuro(costInEur) } @ ${ TIBIA_COIN_COST_IN_EUR } per TC`;
	}

	// If it’s an auction detail page, simplify and future-proof the URL
	// in the address bar.
	const url = new URL(location);
	if (
		url.pathname === '/charactertrade/' &&
		url.searchParams.get('page') === 'details' &&
		url.searchParams.has('auctionid')
	) {
		const queryString = `?page=details&auctionid=${ url.searchParams.get('auctionid') }`;
		if (url.search !== queryString) {
			url.search = queryString;
			history.replaceState({}, '', url);
		}
	}
}
