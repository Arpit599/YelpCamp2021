// if (process.env.NODE_ENV !== 'production') {
//   require('dotenv').config();
// }

require('dotenv').config();

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

const mongooseSanitizer = require('express-mongo-sanitize');
const helmet = require('helmet');

const MongoStore = require('connect-mongo')(session);

// const dbURL = process.env.DB_URL;
const dbURL = process.env.DB_URL || "mongodb://localhost:27017/yelpcamp";
const secret = process.env.SECRET || "SecretCode";

const store = new MongoStore({
  url: dbURL,
  secret,
  touchAfter: 24 * 60 * 60
})

store.on("error", function (e) {
  console.log("Session store error", e);
});

const sessionConfig = {
  store,
  secret,
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    //secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}

mongoose.connect(dbURL, {
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
app.use(mongooseSanitizer());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/css/bootstrap.min.css",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [
  "https://fonts.gstatic.com/s/opensans/v13/DXI1ORHCpsQm3Vp6mXoaTegdm0LZdjqr5-oayXSOefg.woff2",
  "https://fonts.gstatic.com/s/opensans/v13/k3k702ZOKiLJc3WVjuplzOgdm0LZdjqr5-oayXSOefg.woff2",
  "https://fonts.gstatic.com/s/opensans/v13/MTP_ySUJH_bn48VBG8sNSugdm0LZdjqr5-oayXSOefg.woff2",
  "https://fonts.gstatic.com/s/opensans/v13/cJZKeOuBrn4kERxqtaUH3VtXRa8TVwTICgirnJhmVJw.woff2"
];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dzre5qhvl/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error occured"));
db.once("open", () => {
  console.log("Connection Open");
});

app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new localStrategy(User.authenticate()));

app.use((req, res, next) => {
  //console.log(req.query);
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  // console.log(req.session);
  next();
});

app.use('/', userRoutes);
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

const port = process.env.PORT || 8000;

app.listen(port, (req, res) => {
  console.log(`SERVER IS WORKING AT ${port}`);
});
