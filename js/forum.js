// Improve forum usability.
if (/forum(?:\.test)?\.tibia\.com$/.test(location.hostname)) {

	var regexThreadID = /^Thread\x20#/;
	var threadID = '';
	each(document.querySelectorAll('b'), function(el) {
		var text = el.innerText;
		if (regexThreadID.test(text)) {
			threadID = text.replace(regexThreadID, '');
			return false; // break
		}
	});

	each(document.querySelectorAll('a[name^="post"]'), function(el) {
		var postID = el.name.replace(/^post/, '');
		el.href = strip`/forum/?action=thread&threadid=${ threadID }&
			postid=${ postID }#post${ postID }`;
		el.innerHTML = '\xB6';
		el.className = 'mths-tibia-permalink';
	});

}
