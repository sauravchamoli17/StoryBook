const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const pug = require('pug');
const methodOverride = require('method-override');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const dotenv = require('dotenv');
const connectDb = require('./db/db');

// Load dotenv config
dotenv.config();
const PORT = process.env.PORT;
const app = express();

// Passport Config 
require('./passport')(passport);

connectDb();

// Logging Request Stats via Morgan
if (process.env.NODE_ENV === 'development')
    app.use(morgan('dev'));

// Method override
app.use(methodOverride('_method'));

// Set Template Engine 
app.set('view engine', 'pug');

// Session 
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection})
}));

// // Initialize Passport and restore authentication state, if any, from the session.
app.use(passport.initialize());
app.use(passport.session());

// Define Routes 
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/stories', require('./routes/stories'));

// Static Assets
app.use(express.static(path.join(__dirname, 'public')));
    
app.listen(process.env.PORT || 5000,() => console.log(`Server started at ${process.env.NODE_ENV} mode on ${PORT}`));