"strict";

require('dotenv-safe').load();


// if (IS_PRODUCTION) {
//     process.env.HOST = process.env.PROD_HOST;

// } else {
//     process.env.HOST = process.env.PROD_HOST + ':' + process.env.PORT;

// }


const path      = require('path');
const fs        = require('grunt').file;

fs.defaultEncoding = 'utf8';

const _         = require('lodash');
const chalk     = require('chalk');
const chokidar  = require('chokidar');

const SVGO      = require('svgo');
const svgo      = new SVGO({

});



const IS_PRODUCTION = process.env.NODE_ENV === 'production' ? true : false;



global.SRC_DIR      = path.join(process.cwd(), 'app');
global.VIEWS_DIR    = path.join(process.cwd(), 'app/views');
global.PUBLIC_DIR   = path.join(process.cwd(), 'public');


// Ensure public directory structures exist
global.ASSET_DIRS = {
    CSS:    'css'
,   IMG:    'images'
,   JS:     'js'
,   FONTS:  'fonts'
};

_.each(ASSET_DIRS, function(pubDir, id) {
    let dir = path.join(PUBLIC_DIR, pubDir);

    if (!fs.exists(dir)) {
        fs.mkdir(dir);
    }
});


// RUN INITIAL BUILD ON START UP
styles();
scripts();
images();
fonts();



// One-liner for current directory, ignores .dotfiles

const watchPath = path.join(process.cwd(), '/app/**/*');

chokidar
    .watch(watchPath, {
        ignored: /(^|[\/\\])\../
    ,   persistent: true
    })
    .on('change', (filepath, stats) => {

        let ext = path.extname(filepath);

        if (ext.match(/styl/)) { styles(); }
        if (ext.match(/js/)) { scripts(); }
        if (ext.match(/jpeg|jpg|png|gif|tiff/)) { images(); }
        if (ext.match(/eot|woff|woff2|ttf|otf/)) { fonts(); }
        if (ext.match(/svg/)) { svg(); }
        // console.log(chalk.green('Site ready!'));

    });



// run app instance
require('../index.js');



//
// MIGRATE IMAGE ASSETS TO PUBLIC DIRECTORY
//

function images() {

    // TODO: leverage kraken.io API to optimize image assets for production
    //   -- https://www.npmjs.com/package/kraken

    let images = fs.expand({ filter: 'isFile' }, [
            path.join(SRC_DIR, ASSET_DIRS.IMG, '**/*')
        ]);

    _.each(images, function(filepath) {
        // console.log(filepath);
        let filename = filepath
                .replace(/\s+/gi, '-')
                .toLowerCase()
                .substr(path.join(SRC_DIR, ASSET_DIRS.IMG).length)
            ;

        let newImage = path.join(PUBLIC_DIR, ASSET_DIRS.IMG, filename);

        fs.copy(filepath, newImage);
    });

    console.log(chalk.green('migrated images'));

}



//
// MIGRATE IMAGE ASSETS TO PUBLIC DIRECTORY
//

function svg() {

    let svgs = fs.expand({ filter: 'isFile' }, [
            path.join(SRC_DIR, ASSET_DIRS.IMG, '**/*')
        ]);


    _.each(svgs, function(filepath) {

        let filename = filepath
                .replace(/\s+/gi, '-')
                .toLowerCase()
                .substr(path.join(SRC_DIR, ASSET_DIRS.IMG).length)
            ;

        let newFilepath = path.join(PUBLIC_DIR, ASSET_DIRS.IMG, filename);

        let content = fs.read(filepath, { encoding: 'utf-8' });

        if (IS_PRODUCTION) {

            svgo
                .optimize(content, function(res) {
                    fs.write(newFilepath, res.data);
                })
            ;

        } else {
            fs.copy(filepath, newFilepath);

        }

    });

    console.log(chalk.green('migrated SVGs'));

}



//
// MIGRATE FONT ASSETS
//

function fonts() {

    let fonts = fs.expand({ filter: 'isFile' }, [
            path.join(SRC_DIR, ASSET_DIRS.FONTS, '**/*')
        ]);

    _.each(fonts, function(filepath) {
        // console.log(image);
        let filename = filepath
                .replace(/\s+/gi, '-')
                .toLowerCase()
                .substr(path.join(SRC_DIR, ASSET_DIRS.FONTS).length)
            ;

        let newFont = path.join(PUBLIC_DIR, ASSET_DIRS.FONTS, filename);

        if (!fs.exists(newFont)) {
            fs.copy(filepath, newFont);
        }
    });

    console.log(chalk.green('migrated fonts'));

}






//
// COMPILE JS FILES
//

function scripts() {

    let Uglify = require('uglify-js');

    let scripts = fs.expand({ filter: 'isFile' }, [
            path.join(SRC_DIR, ASSET_DIRS.JS, '**/*')
        ]);

    _.each(scripts, function(script) {
        let filename = script
                .replace(/\s+/gi, '-')
                .toLowerCase()
                .substr(path.join(SRC_DIR, ASSET_DIRS.JS).length)
            ;

        let newImage = path.join(PUBLIC_DIR, ASSET_DIRS.JS, filename);

        if (IS_PRODUCTION) {
            let content = Uglify.minify(fs.read(script), {fromString: true});

            fs.write(newImage, content.code, { encoding: 'utf8' });

        } else {
            fs.copy(script, newImage);
        }

    });

    console.log(chalk.green('compiled JS'));

}


//
// COMPILE STYLES
//

function styles() {

    let Stylus = require('stylus');

    let styles = fs.expand({ filter: 'isFile' }, [
            path.join(SRC_DIR, ASSET_DIRS.CSS, '**/*')
        ,   "!"+path.join(SRC_DIR, ASSET_DIRS.CSS, '**/_*')
        ]);


    _.each(styles, function(style) {
        let filename = path.basename(style)
                .replace(/\s+/, '-')
                .toLowerCase()
            ;

        let newStyle = path.join(PUBLIC_DIR, ASSET_DIRS.CSS, filename.replace(/\.[\w\d]+$/, '.css'));

        let content = fs.read(style);

        Stylus(content)
            .set('filename',    style)
            .set('paths',       [ path.join(SRC_DIR, ASSET_DIRS.CSS, '/') ])
            .set('linenos',     process.env.NODE_ENV ? false : true)
            .set('compress',    process.env.NODE_ENV ? true : false)
            .render(function(err, css) {

                if (err) {
                    console.error(err);
                }

                // console.log(css);
                fs.write(newStyle, css);
            })
        ;

    });

    console.log(chalk.green('compiled styles'));

}


