var dateFormat = require('dateformat');
var jsesc = require('jsesc');

module.exports = function(grunt) {

	grunt.initConfig({
		'shell': {
			'scrape': {
				'command': 'phantomjs --load-images=no scripts/scrape.js',
				'stdout': grunt.warn,
				'stderr': grunt.warn
			}
		},
		'template': {
			'build': {
				'options': {
					'data': function() {
						return {
							'buildings': jsesc(require('./data/buildings.json')),
							'version': dateFormat(new Date, 'yyyy-mm-dd HH:MM:ss')
						};
					}
				},
				'files': {
					'tibia.user.js': 'src/tibia.user.src.js'
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-template');

	grunt.registerTask('default', [
		'shell',
		'template'
	]);

};
