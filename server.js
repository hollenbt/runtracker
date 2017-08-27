const express = require('express');
const hbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

//Sessions
const session = require('express-session');
const connectMongo = require("connect-mongo")(session);

//Authentication
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// Mongoose connection
mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI, { useMongoClient: true });
mongoose.Promise = global.Promise;

const app = express();

// Setting up handlebars
app.engine('.hbs', hbs({ defaultLayout: 'main', extname: '.hbs' }));
app.set('view engine', '.hbs');

app.use(express.static('./public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Use sessions stored in a MongoDB
app.use(session({
    secret: 'Coconut La Croix sucks',
    resave: false,
    saveUninitialized: false,
    store: new connectMongo({ mongooseConnection: mongoose.connection })
}));

const Account = require('./models/account.js');
const Course = require('./models/course.js');
const Run = require('./models/run.js');

// Setting up passport
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());


// Defining the middleware.
app.use(passport.initialize());
app.use(passport.session());

// If authenticated, load user information into res.locals for use
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

// The home page.
app.get('/', function(req, res) {
    res.render('home');
});

// The signup page.
app.get('/signup', function(req, res) {
    res.render('signup');
});

// Account creation.
app.post('/signup', function(req, res, next) {
    Account.register({username: req.body.username}, req.body.password, function(err, account) {
        if (err) res.redirect('/signup');
        else res.redirect('/login');
    });
});

// The login page.
app.get('/login', function(req, res) {
    res.render('login');
});

// Let passport handle authentication.
app.post('/login', 
    passport.authenticate('local', {
        successRedirect: '/', // if successful, go to home page
        failureRedirect: '/login' // otherwise, return to login page
    })
);

/****************************************************************************/
// Only logged in users can access subsequent middleware.
app.use(function(req, res, next) {
    if (res.locals.authenticated)
        next();
    else res.render('home', { mustBeLoggedIn: true });
});
/****************************************************************************/

// The user account page.
app.get('/myaccount', function(req, res, next) {
    res.render('myAccount');
});

// Generate a report.
app.post('/report', function(req, res) {
    Run.find({ username: res.locals.user })
    .where('date').gte(new Date(Number(req.body.begin)))
    .where('date').lte(new Date(Number(req.body.end)))
    .sort({ date: -1 }).exec(function(err, results) {
        if (err) return next(err);
        res.end(JSON.stringify(results));
    });
});

// Page to add new courses.
app.get('/addcourse', function(req, res) {
    if (res.locals.authenticated)
        res.render('addCourse');
    else res.redirect('/');
});

// Save a mapped course.
app.post('/saveCourse', function(req, res, next) {
    Course.findOne({ username: res.locals.user, name: req.body.name }).exec(function(err, course) {
        if (err) return next(err);
        if (course)
            res.end("Course name already taken.");
        else {
            var newCourse = new Course({
                username: res.locals.user,
                name: req.body.name,
                distance: req.body.distance,
                route: req.body.route
            });
            newCourse.save(function(err) {
                if (err) return next(err);
                res.end("Course saved successfully.");
            });
        }
    });
});

// Page to log running activity.
app.get('/logrun', function(req, res, next) {
    Course.find({ username: res.locals.user }).sort({ name: 1 }).exec(function(err, results) {
        if (err) return next(err);
        res.render('logRun', { course: results });
    });
});

// Log a run.
app.post('/logrun', function(req, res, next) {
    var newRun = new Run({
        username: res.locals.user,
        date: new Date(Number(req.body.date)),
        distance: req.body.distance,
        duration: req.body.duration
    });
    newRun.save(function(err) {
        if (err) return next(err);
        res.end("Run logged successfully.");
    });
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

app.listen(process.env.PORT || 5000);