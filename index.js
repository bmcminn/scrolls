require('dotenv-safe').load();

const MDit      = require('markdown-it');
const md        = new MDit();

const _         = require('lodash');
const lowdb     = require('lowdb');
const fs        = require('grunt').file;
const path      = require('path');

const Express   = require('express');
const exphbs    = require('express-handlebars');
const yamlFM    = require('yaml-front-matter');


global.VIEWS_DIR    = path.join(process.cwd(), 'app/views');
global.VIEWS_EXT    = '.hbs';
global.APP_DIR      = path.join(process.cwd(), 'app');
global.PUBLIC_DIR   = path.join(process.cwd(), 'public');
global.CONTENT_DIR  = path.join(process.cwd(), 'content');

const app = new Express();


app.set('model', fs.readYAML(path.join(APP_DIR, 'config.yaml')));

// app.use(require('body-parser')({}));


// SET STATIC DIRECTORY
app.use(Express.static('public'));


// SET VIEWS MODULE
app.set('views', VIEWS_DIR);

app.engine(VIEWS_EXT, exphbs({
    defaultLayout: 'main'
,   layoutsDir:   'app/views/layouts'
,   partialsDir:  'app/views/partials'
,   extname: VIEWS_EXT
,   helpers: require('./app/hbs-helpers.js')
}));

app.set('view engine', VIEWS_EXT);


// INITIAL HOMEPAGE ROUTE
app.get('/', function(req, res) {
    res.render('home', app.get('model'));
});


// INITIAL HOMEPAGE ROUTE
app.get('/:filename', function(req, res) {

    let model = app.get('model');

    let filename = req.params.filename;

    let filepath = path.join(CONTENT_DIR, filename+'.md');

    if (fs.exists(filepath)) {

        model.file = yamlFM.loadFront(filepath, 'body');

        model.file.content = fs.read(filepath);

        console.log(model);

        res.render('home', model);
        return;

    }


    res.status(404).render('404', model);

});


app.listen(process.env.PORT || 3005, () => {
    console.log(`Local site: http://localhost:${process.env.PORT}`);
});
