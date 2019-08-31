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
					'dist/js/Payoff.min.js': 'src/*'
				}
			}
		},

		clean: {
			all: `dist/*`
		},

		jasmine: {
			all: {
				src: "dist/js/*.js",
				options: {
					specs: "spec/*.js"
				}
			}
		},

		jshint: {
			options: {
				esversion: 6
			},
			all: [
				`src/*.js`,
				`spec/*.js`
			]
		},
	
		uglify: {
			compile: {
				files: {
					"/app/dist/js/Payoff.min.js": "/app/dist/js/Payoff.min.js"
				}
			}
		} 
	});

	grunt.registerTask(`default`, [
		`jshint`,
		`clean`,
		`babel`,
		`uglify`,
		`jasmine`
	]);
};