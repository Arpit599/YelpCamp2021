const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user');
//Destructuring so that more schemas could be accompanied later
// const { campgroundSchema, reviewSchema } = require('./joiSchemas');
const userRoutes = require('./routes/userRoutes');
const campgroundRoutes = require('./routes/campgroundRoutes');
const reveiwRoutes = require('./routes/reviewRoutes');

const sessionConfig = {
  secret: 'SecretCode',
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}

mongoose.connect("mongodb://localhost:27017/yelpcamp", {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static('public'));
app.use(flash());

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error occured"));
db.once("open", () => {
  console.log("Connection Open");
});

app.use(session(sessionConfig));
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new localStrategy(User.authenticate()));

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id', reveiwRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

app.get('/fakerequest', async (req, res) => {
  const user = new User({ email: 'arpit@gmail.com', username: 'ab599' });
  const savedUser = await User.register(user, 'monkey');
  res.send(savedUser);
})
//If none of the routes above are matched, then execute this app.all for Page not found error
app.all('*', (req, res, next) => {
  next(new ExpressError('Page not found', 404));
});

//Our error handler
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) {
    err.message = 'Oh no! Something went wrong';
  }
  res.status(statusCode).render('campgrounds/error', {err});
  // res.send("OH NO! ERROR");
  // console.log(err.message);
});

app.listen(8000, (req, res) => {
  console.log("SERVER IS WORKING AT 8000");
});
