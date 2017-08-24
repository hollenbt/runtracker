require('dotenv').config();
const express = require('express');
const hbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

//sessions
const session = require('express-session');
const connectMongo = require("connect-mongo")(session);

//authentication
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const LocalStrategy = require('passport-local').Strategy;

// mongoose connection
mongoose.connect(process.env.MONGO_URI, { useMongoClient: true });
mongoose.Promise = global.Promise;

const app = express();

// setting up handlebars
app.engine('.hbs', hbs({ defaultLayout: 'main', extname: '.hbs' }));
app.set('view engine', '.hbs');

app.use(express.static('./public'));
app.use(bodyParser.urlencoded({ extended: true }));

// use session that are stored in mongo
app.use(session({
    secret: 'Coconut La Croix sucks',
    resave: false,
    saveUninitialized: false,
    store: new connectMongo({ mongooseConnection: mongoose.connection })
}));

// the account schema
var accountSchema = new mongoose.Schema({
    username: {type: String, unique: true, index: true}
});

// adding passport magic to the schema
accountSchema.plugin(passportLocalMongoose);

// getting the mongoose model
const Account = mongoose.model('account', accountSchema);

// setting up passport
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());


// defining the middelware
app.use(passport.initialize());
app.use(passport.session());

// if authenticated, load user information into res.locals for use
// in handlebars templates
app.use(function(req, res, next) {
    console.log(req.url);
    if (req.isAuthenticated()) {
        res.locals.authenticated = true;
        res.locals.user = req.user.username;
        res.locals.googleMapsAPI = "https://maps.googleapis.com/maps/api/js?key=" + process.env.API_KEY + "&callback=initMap";
    }
    next();
});

// home page (root)
app.get('/', function(req, res) {
    res.render('home');
});

// signup page
app.get('/signup', function(req, res) {
    res.render('signup');
});

// account creation
app.post('/signup', function(req, res, next) {
    Account.register({username: req.body.username}, req.body.password, function(err, account) {
        if (err) res.render('signup');
        res.redirect('/login');
    });
});

// The login page
app.get('/login', function(req, res, next) {
    res.render('login');
});

// We let passport do the authentication
app.post('/login', 
    passport.authenticate('local', {
        successRedirect: '/', // if successful, go to home page
        failureRedirect: '/login' // otherwise, return to login page
    })
);

// the user's account page
// currently being used to add a run only
app.get('/myaccount', function(req, res, next) {
    if (res.locals.authenticated)
        res.render('addRun');
    else res.redirect('/');
});

// log the user out
app.get('/logout', function(req, res) {
    req.logout();
    req.session.destroy();
    res.redirect('/');
});

// error handler
app.use(function(err, req, res, next) {
    res.status(500);
    res.type('text/plain');
    res.send('Error:\n\n' + err.stack);
});

// Page Not Found
app.use(function(req, res) {
    res.status(404);
    res.render('404');
});

app.listen(process.env.PORT || 3000);