'use strict';

const elGuildInfo = document.getElementById('GuildInformationContainer');

if (elGuildInfo) {

	// This is a guild detail page. Example:
	// https://www.tibia.com/community/?subtopic=guilds&page=view&world=Wintera&GuildName=Forward&onlyshowonline=0
	// https://www.tibia.com/community/?subtopic=guilds&page=view&world=Wintera&GuildName=Gospel+Sounds&onlyshowonline=0

	// Link to guildhall detail pages.
	const regex = /(?:^|>\n)The guild was founded on ([a-zA-Z]+) on/;
	const worldName = elGuildInfo.innerHTML.match(regex)[1];
	elGuildInfo.innerHTML = elGuildInfo.innerHTML.replace(
		/<br>\nTheir home on ([a-zA-Z]+) is ([^.]+)\./,
		function(match, worldName, building) {
			return strip`<a href="${ ORIGIN }/community/?subtopic=houses
				&amp;page=view&amp;world=${ worldName }
				&amp;${ getBuildingParams(building, '&amp;') }">
				${ match }</a>`;
		}
	);

	// Make the “show online” / “show all” button perform a clean GET.
	each(
		document.querySelectorAll(
			'form[action="https://www.tibia.com/community/?subtopic=guilds"]'
		),
		function(form) {
			const button = form.querySelector('input[name^="Show"]');
			if (button) {
				form.innerHTML = strip`
					<a href="${ ORIGIN }/community/?subtopic=guilds&page=view
					${ (form.order.value ? '&order=' + encode(form.order.value) : '') }
					&world=${ worldName }
					&GuildName=${ encode(form.GuildName.value) }
					&onlyshowonline=${ encode(form.onlyshowonline.value || '0') }">
						${ button.alt }
					</a>`;
			}
		}
	);

	// Normalize the URL in the address bar.
	const elGuildName = document.querySelector('#guilds .BoxContent h1');
	const guildName = elGuildName.textContent;
	const queryString = strip`?subtopic=guilds
		&page=view
		&world=${ worldName }
		&GuildName=${ guildName }
		&onlyshowonline=0`;
	if (!location.search.includes('&world=')) {
		history.replaceState({}, guildName, queryString);
	}

} else {

	const elWorldName = document.querySelectorAll('.text')[1];
	if (elWorldName && elWorldName.textContent.includes('Active Guilds on')) {
		// This is a “guilds in world” page. Example:
		// https://www.tibia.com/community/?subtopic=guilds&world=Wintera
		const worldName = elWorldName.textContent.match(/[A-Za-z]+$/)[0];
		const queryString = `?subtopic=guilds&world=${ worldName }`;
		if (!location.search.includes(queryString)) {
			history.replaceState({}, `Guilds in ${ worldName }`, queryString);
		}
	}

}
