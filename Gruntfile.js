/*!
 * Grunt file
 *
 * @package MobileFrontend
 */

/*jshint node:true, strict:false*/
/*global module*/
module.exports = function ( grunt ) {

	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-jscs' );
	grunt.loadNpmTasks( 'grunt-contrib-qunit' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-notify' );
	grunt.loadNpmTasks( 'grunt-svg2png' );

	grunt.initConfig( {
		URL: process.env.URL || 'http://127.0.0.1:8080/w/index.php/',
		QUNIT_FILTER: ( process.env.QUNIT_FILTER && '&filter=' + process.env.QUNIT_FILTER ) || '',
		files: {
			js: 'javascripts/**/*.js',
			jsTests: 'tests/qunit/**/*.js'
		},
		svg2png: {
			dist: {
				src: 'less/images/icons/*.svg'
			}
		},
		jshint: {
			options: {
				jshintrc: true
			},
			all: [
				'<%= files.js %>',
				'!javascripts/externals/**/*.js'
			]
		},
		jscs: {
			src: '<%= jshint.all %>'
		},
		qunit: {
			all: {
				options: {
					urls: [ '<%= URL %>Special:JavaScriptTest/qunit?useformat=mobile<%= QUNIT_FILTER %>' ]
				}
			}
		},
		watch: {
			lint: {
				files: [ '<%= files.js %>', '<%= files.jsTests %>' ],
				tasks: [ 'lint' ]
			},
			scripts: {
				files: [ '<%= files.js %>', '<%= files.jsTests %>' ],
				tasks: [ 'test' ]
			},
			configFiles: {
				files: [ 'Gruntfile.js' ],
				options: {
					reload: true
				}
			}
		}
	} );

	grunt.registerTask( 'lint', [ 'jshint', 'jscs' ] );
	// Jenkins automatically runs grunt test for us
	grunt.registerTask( 'test', [ 'lint', 'qunit' ] );
	grunt.registerTask( 'default', [ 'test' ] );
	grunt.registerTask( 'build-icons', [ 'svg2png' ] );
};
