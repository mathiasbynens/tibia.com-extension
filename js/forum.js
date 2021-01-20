'use strict';

// Improve forum usability.
if (location.pathname.startsWith('/forum/')) {

	// Make individual posts easily permalinkable.
	const regexThreadID = /^Thread\x20#/;
	let threadID = '';
	each(document.querySelectorAll('b'), function(el) {
		const text = el.innerText;
		if (regexThreadID.test(text)) {
			threadID = text.replace(regexThreadID, '');
			return false; // break
		}
	});

	each(document.querySelectorAll('a[name^="post"]'), function(el) {
		const postID = el.name.replace(/^post/, '');
		el.href = strip`/forum/?action=thread&threadid=${ threadID }&
			postid=${ postID }#post${ postID }`;
		el.textContent = '\xB6';
		el.className = 'mths-tibia-permalink';
	});

	// Remember the character used for posting.
	const select = document.querySelector('select[name="forum_character"]');
	if (select) {
		const separator = '|';
		chrome.storage.sync.get(['forumCharacter'], (storedCharacter) => {
			if (storedCharacter) {
				const [value, character] = storedCharacter.split(separator);
				each(select.options, (option, index) => {
					if (option.value == value && option.textContent == character) {
						select.selectedIndex = index;
						return false; // break
					}
				});
			}
		});
		select.oninput = function() {
			const index = select.selectedIndex;
			const value = select.value;
			const character = select.options[index].textContent;
			const id = `${ value }${ separator }${ character }`;
			chrome.storage.sync.set({ forumCharacter: id }, () => {
				// console.log('Setting saved!');
			});
		};
	}

}
