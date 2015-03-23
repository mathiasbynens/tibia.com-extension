var elGuildInfo = document.getElementById('GuildInformationContainer');

if (elGuildInfo) {

	// This is a guild detail page. Example:
	// https://secure.tibia.com/community/?subtopic=guilds&page=view&GuildName=Glooth&onlyshowonline=0

	// Link to guildhall detail pages.
	var regex = /Their home on ([a-zA-Z]+) is ([a-zA-Z\x20,]+)./;
	elGuildInfo.innerHTML = elGuildInfo.innerHTML.replace(regex, function($0, $1, $2) {
		return $0.link(
			ORIGIN + '/community/?subtopic=houses&amp;page=view&amp;world=' + $1 +
			'&amp;' + getBuildingParams($2, '&amp;')
		);
	});

	// Make the “show online” / “show all” button perform a clean GET.
	each(document.querySelectorAll('form[action="http://www.tibia.com/community/?subtopic=guilds"]'), function(form) {
		var button = form.querySelector('input[name^="Show"]');
		if (button) {
			form.innerHTML = button.alt.link(
				ORIGIN + '/community/?subtopic=guilds&page=view' +
				(form.order.value ? '&order=' + encode(form.order.value) : '') +
				'&GuildName=' + encode(form.GuildName.value) +
				'&onlyshowonline=' + encode(form.onlyshowonline.value || '0')
			);
		}
	});

	// Normalize the URL in the address bar.
	var elGuildName = document.querySelector('#guilds .BoxContent h1');
	var guildName = elGuildName.textContent;
	var queryString = '?subtopic=guilds&page=view&GuildName=' + guildName
		+ '&onlyshowonline=0';
	if (!location.search.includes('GuildName')) {
		history.replaceState({}, guildName, queryString);
	}

} else {

	var elWorldName = document.querySelectorAll('.text')[1];
	if (elWorldName && elWorldName.textContent.includes('Active Guilds on')) {
		// This is a “guilds in world” page. Example:
		// https://secure.tibia.com/community/?subtopic=guilds&world=Xantera
		var worldName = elWorldName.textContent.match(/[A-Za-z]+$/)[0];
		var queryString = '?subtopic=guilds&world=' + worldName;
		if (!location.search.includes(queryString)) {
			history.replaceState({}, 'Guilds in ' + worldName, queryString);
		}
	}

}
