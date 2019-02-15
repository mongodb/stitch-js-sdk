module.exports = function(grunt)
{
    grunt.initConfig({
        sass: {
            options: {
                style: 'compact',
                unixNewlines: true
            },
            themeDefault: {
                files: [{
                    expand: true,
                    cwd: 'src/assets/css',
                    src: ['**/*.sass', '**/*.scss'],
                    dest: 'bin/assets/css',
                    ext: '.css'
                }]
            }
        },
        autoprefixer: {
            options: {
                cascade: false
            },
            themeDefault: {
                expand: true,
                src: 'bin/**/*.css',
                dest: './'
            }
        },
        curl: {
            'bin/assets/css/feedback.css': 'https://raw.githubusercontent.com/mongodb/docs-tools/master/themes/mongodb/static/feedback.css',
            'bin/assets/js/feedback.min.js': 'https://raw.githubusercontent.com/mongodb/docs-tools/master/themes/mongodb/static/feedback.min.js',
            'bin/assets/js/bootstrap.min.js': 'https://raw.githubusercontent.com/mongodb/docs-tools/master/themes/mongodb/static/lib/bootstrap.min.js',
            'bin/assets/js/underscore.min.js': 'https://raw.githubusercontent.com/mongodb/docs-tools/master/themes/mongodb/static/lib/underscore-min.js',
            'bin/assets/js/jquery.min.js': 'https://raw.githubusercontent.com/mongodb/docs-tools/master/themes/mongodb/static/lib/jquery.min.js',
            'bin/assets/js/jquery.cookie.js': 'https://raw.githubusercontent.com/mongodb/docs-tools/master/themes/mongodb/static/lib/jquery.cookie.js'
        },
        copy: {
            plugin: {
              files: [{
                expand: true,
                cwd: 'src',
                src: ['*.js'],
                dest: 'bin'
              }]
            },
            themeCustom: {
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: ['**/*.hbs', '**/*.png'],
                    dest: 'bin'
                }]
            },
            fonts: {
                files: [{
                    expand: true,
                    cwd: 'fonts',
                    src: ['*'],
                    dest: 'bin/assets/fonts'
                }]
            },
            css: {
                files: [{
                    expand: true,
                    cwd: 'src/assets/css',
                    src: ['**/*.css'],
                    dest: 'bin/assets/css'
                }]
            },
        },
    });

    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-curl');

    grunt.registerTask('css', ['sass', 'autoprefixer']);
    grunt.registerTask('default', ['curl', 'copy', 'css']);
};
