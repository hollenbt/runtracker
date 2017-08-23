const express = require('express');
const hbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

//cookies
const cookieParser = require('cookie-parser');

//sessions
const session = require('express-session');
const connectMongo = require("connect-mongo")(session);

//authentication
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const LocalStrategy = require('passport-local').Strategy;