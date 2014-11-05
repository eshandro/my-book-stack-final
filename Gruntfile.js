// Export the gruntfile for use in terminal
module.exports = function(grunt) {
	// Initialize the configuration
	grunt.initConfig({
		// A 'top level' key
		// Setup uglify tasks
		uglify: {
			// Subtasks go here
			// define the 'dev' subtask
			dev: {
				// Specify files using files-object format
				files: {
					// 'Destination file': [source files]
					'public/scripts/bookApp.min.js': ['public/scripts/bookApp.js']
				}
			},
			options: {
				sourceMap: true,
				compress: {
					drop_console: true,
				}
			}
		},

		build: {
			files: {
				// 'Destination file': [source files]
				'public/scripts/bookApp.min.js': ['public/scripts/bookApp.js']
			},
			options: {
				sourceMap: true,
				banner: '// Production build on <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			}

		},
		cssmin: {
			dev: {
				
				// Below is the expanded syntax that allows you to 
				// specify more options and keeps multiple files 
				// separate instead of concat them
				files: [
					{
						expand: true,
						cwd: 'public/css/',
						src: ['*.css'],
						dest: 'public/css/min',
						ext: '.min.css',
					}
				]
			}
		},
		// Configure the contrib-watch plugin
		watch: {
			scripts: {
				files: [
				'public/scripts/bookApp.js'
				],
				tasks: ['uglify:dev']
			},
			css: {
				files: ['public/css/*.css'],
				tasks: ['cssmin:dev'],
			}
		}

	});

	// Create a custom task
	grunt.registerTask(
		// First param is name and second is array of tasks to run
		// To run in terminal - just run 'grunt dev' in terminal
		'dev', ['uglify', 'cssmin', 'watch']
		);
	grunt.registerTask(
		'build', ['uglify:build', 'cssmin'])

	// Load in the uglify plugin
	grunt.loadNpmTasks(
		'grunt-contrib-uglify'
		);
	grunt.loadNpmTasks(
		'grunt-contrib-cssmin')
	grunt.loadNpmTasks(
		'grunt-contrib-watch'
		);
}