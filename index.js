const MDit      = require('markdown-it');
const md        = new MDit();

const _         = require('lodash');
const lowdb     = require('lowdb');
const fs        = require('grunt').file;
const path      = require('path');

const Express   = require('express');
const exphbs    = require('express-handlebars');



global.VIEWS_DIR    = path.join(process.cwd(), 'app/views');
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

app.engine('.hbs', exphbs({
    defaultLayout: 'main'
,   layoutsDir:   'app/views/layouts'
,   partialsDir:  'app/views/partials'
,   extname: '.hbs'
,   helpers: require('./app/hbs-helpers.js')
}));
app.set('view engine', '.hbs');


// INITIAL HOMEPAGE ROUTE
app.get('/', function(req, res) {
    res.render('home', app.get('model'));
});


app.listen(3005);
