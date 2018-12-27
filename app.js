var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var config = require('./config/database');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var fileUpload = require('express-fileupload');
var passport = require('passport')

//Connect Db
mongoose.connect(config.database,{ useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Connect mongodb');
});

//Init app
var app = express();

//View Engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set Public folder
app.use(express.static(path.join(__dirname, 'public')));

//Get Page Model
var Page = require('./models/page');

//Get all pages pass to header.ejs
Page.find({}).sort({ sorting: 1 }).exec(function (err, pages) {
    if (err) {
        console.log(err)
    } else {
        app.locals.pages = pages;
    }
})

// Set global errors variable
app.locals.errors = null;

//Express fileupload middleware

app.use(fileUpload());

//Body parse middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    //   cookie: { secure: true }
}))

// Express Validator middleware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    },
    customValidators: {
        isImage: function (value, filename) {
            var extension = (path.extname(filename)).toLowerCase();
            switch (extension) {
                case '.jpg':
                    return '.jpg';
                case '.jpeg':
                    return '.jpeg';
                case '.png':
                    return '.png';
                case '':
                    return '.jpg';
                default:
                    return false;
            }
        }
    }
}));

//passport config
require('./config/passport')(passport);


//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Express Message
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

app.get('*', function (req, res, next) {
    res.locals.cart = req.session.cart;
    res.locals.user = req.user || null
    next();
})

//Set Routers
var pages = require('./routes/pages.js');
var user = require('./routes/users');
var adminusers = require('./routes/adminusers.js');
var admincsvupload = require('./routes/admincsvuplod');


app.use('/', pages);
app.use('/users', user);
app.use('/admin/users', adminusers);
app.use('/admin/csvupload',admincsvupload);

//Start Server
var port = 3000;
app.listen(port, function () {
    console.log('Server starteed port' + port)
})

