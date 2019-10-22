module.exports = function(grunt) { // grunt task configuration
	require(`load-grunt-tasks`)(grunt);

	grunt.initConfig({
		pkg: grunt.file.readJSON(`package.json`),

		babel: {
			options: {
				presets: ['@babel/preset-env'],
			},
			dist: {
				files: {
					"dist/Payoff.min.js": 'src/*'
				}
			}
		},

		chmod: {
			options: {
				mode: `777`,
				force: true
			},
			all: {
				src: [`/app/dist/**`],
			}
		},

		clean: {
			options: {
				force: true
			},
			all: `dist/*`
		},

		eslint: {
			options: {
				configFile: '.eslintrc',
			},
		
			target: ['src/Payoff.js'],
		},

		jsdoc: {
			options: {
				private: true,
			},
			all: {
				src: [`src`, `README.md`,],
				dest: `dist`,
			},
		},

		jasmine: {
			all: {
				src: `dist/Payoff.min.js`,
				options: {
					specs: `spec/*.js`
				}
			}
		},
	
		uglify: {
			compile: {
				files: {
					"/app/dist/Payoff.min.js": `/app/dist/Payoff.min.js`
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
		`jsdoc`,
		`chmod`, // avoid permissions issues when deleting
	]);

	grunt.registerTask(`test`, [
		`jasmine`
	]);
};