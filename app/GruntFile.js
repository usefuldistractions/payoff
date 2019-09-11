module.exports = function(grunt) { // grunt task configuration
	require(`load-grunt-tasks`)(grunt);

	grunt.initConfig({
		pkg: grunt.file.readJSON(`package.json`),

		babel: {
			options: {
				presets: ['@babel/preset-env']
			},
			dist: {
				files: {
					"dist/js/Payoff.min.js": 'src/*'
				}
			}
		},

		clean: {
			all: `dist/*`
		},

		eslint: {
			options: {
				configFile: '.eslintrc'
			},
		
			target: ['src/Payoff.js']
		},

		jsdoc: {
			options: {
				private: true
			},
			all: {
				src: `src`,
				dest: `dist/docs`
			}
		},

		jasmine: {
			all: {
				src: `dist/js/*.js`,
				options: {
					specs: `spec/*.js`
				}
			}
		},
	
		uglify: {
			compile: {
				files: {
					"/app/dist/js/Payoff.min.js": `/app/dist/js/Payoff.min.js`
				}
			}
		} 
	});

	grunt.registerTask(`default`, [
		`eslint`,
		`clean`,
		`babel`,
		`uglify`,
		`jasmine`,
		`jsdoc`
	]);
};