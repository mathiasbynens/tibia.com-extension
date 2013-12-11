module.exports = function(grunt) {

	grunt.initConfig({
		'meta': {
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
			'options': {
				'banner': [
					'// ==UserScript==',
					'// @name Tibia.com enhancer',
					'// @description Enhance Tibia.com.',
					'// @version <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>',
					'// @link http://mths.be/tibiauserjs',
					'// @author Mathias Bynens <http://mathiasbynens.be/>',
					'// @match http://*.tibia.com/*',
					'// @match https://*.tibia.com/*',
					'// ==/UserScript=='
				].join('\n') + '\n'
			},
			'js': {
				'src': ['<%= meta.srcfiles %>'],
				'dest': 'tibia.user.js'
			}
		},
		'watch': {
			'files': '<config:meta.srcfiles>',
			'tasks': 'concat'
		}
	});

	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-contrib-concat');

	grunt.registerTask('default', ['shell', 'concat']);

};
