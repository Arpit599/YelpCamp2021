const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
//Destructuring so that more schemas could be accompanied later
// const { campgroundSchema, reviewSchema } = require('./joiSchemas');

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

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error occured"));
db.once("open", () => {
  console.log("Connection Open");
});

app.use(session(sessionConfig));
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id', reveiwRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

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
