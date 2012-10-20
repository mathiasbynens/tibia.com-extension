module.exports = function(grunt) {

	grunt.initConfig({
		'meta': {
			'banner': [
				'// ==UserScript==',
				'// @name Tibia world and house linker',
				'// @description Enhance the character info pages on Tibia.com.',
				'// @version <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>',
				'// @link http://mths.be/tibiauserjs',
				'// @author Mathias Bynens <http://mathiasbynens.be/>',
				'// @match http://www.tibia.com/mmorpg/free-multiplayer-online-role-playing-game.php',
				'// @match http://www.tibia.com/community/?subtopic=character*',
				'// @match http://www.tibia.com/community/?*name=*',
				'// @match http://www.tibia.com/community/?*GuildName=*',
				'// ==/UserScript=='
			].join('\n'),
			'srcfiles': [
				'src/intro.js',
				'data/data.js',
				'src/main.js',
				'src/outro.js'
			]
		},
		'shell': {
			'scrape': {
				'command': 'phantomjs --load-images=no scripts/scrape.js',
				'stdout': grunt.warn,
				'stderr': grunt.warn
			}
		},
		'concat': {
			'js': {
				'src': ['<banner:meta.banner>', '<config:meta.srcfiles>'],
				'dest': 'tibia.user.js'
			}
		},
		'watch': {
			'files': '<config:meta.srcfiles>',
			'tasks': 'concat'
		}
	});

	grunt.loadNpmTasks('grunt-shell');

	grunt.registerTask('default', 'shell concat');

};
