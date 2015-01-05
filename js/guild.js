// https://secure.tibia.com/community/?subtopic=guilds&page=view&GuildName=Glooth&onlyshowonline=0

// Link to guildhall detail pages.
var guildContent = document.querySelector('#guilds .BoxContent');
if (guildContent) {
	guildContent.innerHTML = guildContent.innerHTML.replace(/Their home on ([a-zA-Z]+) is ([a-zA-Z\x20,]+)./, function($0, $1, $2) {
		return $0.link(ORIGIN + '/community/?subtopic=houses&amp;world=' + $1 + '&amp;page=view&amp;houseid=' + TIBIA_BUILDINGS.guildhalls[$2]);
	});
}

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
