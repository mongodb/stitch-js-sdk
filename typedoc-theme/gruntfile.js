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
            }
        },
    });

    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('css', ['sass', 'autoprefixer']);
    grunt.registerTask('default', ['copy', 'css']);
};
