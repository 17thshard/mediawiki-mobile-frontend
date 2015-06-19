/*!
 * Grunt file
 *
 * @package MobileFrontend
 */

/*jshint node:true, strict:false*/
module.exports = function ( grunt ) {
	grunt.loadNpmTasks( 'grunt-mkdir' );
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-jscs' );
	grunt.loadNpmTasks( 'grunt-qunit-istanbul' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-notify' );
	grunt.loadNpmTasks( 'grunt-svg2png' );
	grunt.loadNpmTasks( 'grunt-jsduck' );

	grunt.initConfig( {
		URL: process.env.MEDIAWIKI_URL || 'http://127.0.0.1:8080/w/index.php/',
		QUNIT_DEBUG: ( process.env.QUNIT_DEBUG && '&debug=true' || '' ),
		QUNIT_FILTER: ( process.env.QUNIT_FILTER && '&filter=' + process.env.QUNIT_FILTER ) || '',
		QUNIT_MODULE: ( process.env.QUNIT_MODULE && '&module=' + process.env.QUNIT_MODULE ) || '',
		files: {
			js: 'resources/**/*.js',
			jsTests: 'tests/qunit/**/*.js',
			jsExternals: 'resources/*/externals/**/*.js'
		},
		mkdir: {
			all: {
				options: {
					create: [ 'docs' ]
				},
			},
			jsdocs: {
				options: {
					create: [ 'docs/js' ]
				}
			}
		},
		jshint: {
			options: {
				jshintrc: true
			},
			tests: '<%= files.jsTests %>',
			sources: [
				'<%= files.js %>',
				'!<%= files.jsExternals %>',
			]
		},
		jscs: {
			main: [
				'<%= files.js %>',
				'!<%= files.jsExternals %>'
			],
			test: {
				options: {
					config: '.jscsrctest.js',
				},
				files: {
					src: '<%= files.jsTests %>'
				}
			}
		},
		qunit: {
			all: {
				options: {
					timeout: 20000,
					urls: [
						'<%= URL %>Special:JavaScriptTest/qunit?useformat=mobile' +
						'<%= QUNIT_DEBUG %><%= QUNIT_FILTER %><%= QUNIT_MODULE %>'
					]
				}
			},
			cov: {
				options: {
					timeout: 20000,
					urls: [
						'<%= URL %>Special:JavaScriptTest/qunit?debug=true&useformat=mobile' +
						'<%= QUNIT_FILTER %><%= QUNIT_MODULE %>'
					],
					coverage: {
						prefixUrl: 'w/', // Prefix url on the server
						baseUrl: '../../', // Path to assets from the server (extensions/Mobile...)
						src: [
							'<%= files.js %>',
							'!<%= files.jsExternals %>'
						],
						instrumentedFiles: 'tests/report/tmp',
						htmlReport: 'tests/report'
					}
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
		},
		jsduck: {
			main: {
				src: [
					'<%= files.js %>',
					'!<%= files.jsExternals %>'
				],
				dest: 'docs/js',
				options: {
					'builtin-classes': true,
					'external': [
						'Hogan.Template',
						'HandleBars.Template',
						'jQuery.Deferred',
						'jQuery.Promise',
						'jQuery.Event',
						'jQuery.Object',
						'jqXHR',
						'File',
						'mw.user',
						'mw.Api',
						'CodeMirror',
						'OO.ui.ToolGroup',
						'OO.ui.LookupElement',
						'OO.EventEmitter'
					],
					'ignore-global': true,
					'tags': './.docs/jsduckCustomTags.rb',
					// https://github.com/senchalabs/jsduck/issues/525
					'processes': 0,
					'warnings-exit-nonzero': true,
					'warnings': [ '-nodoc(class,public)', '-dup_member', '-link_ambiguous' ]
				}
			}
		}
	} );

	grunt.registerTask( 'lint', [ 'jshint', 'jscs' ] );
	grunt.registerTask( 'docs', [ 'mkdir:jsdocs', 'jsduck:main' ] );

	// grunt test will be run by npm test which will be run by Jenkins
	// Do not execute qunit here, or other tasks that require full mediawiki
	// running.
	grunt.registerTask( 'test', [ 'lint', 'mkdir', 'jsduck' ] );

	grunt.registerTask( 'default', [ 'test' ] );
};
