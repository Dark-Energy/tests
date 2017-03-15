// Project configuration. 
module.exports = function(grunt) {
	grunt.initConfig({
	uglify: {
      build: {
        src: 'dynalinks/js/*.js',
        dest: 'dynalinks/lib/dynalinks.min.js'
      }
	},
});

grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.registerTask('default', ['uglify']);

};