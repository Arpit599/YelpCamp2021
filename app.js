const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const Campground = require("./models/campground");
const Review = require("./models/review");
const app = express();
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require('./utils/ExpressError');
//Destructuring so that more schemas could be accompanied later
const { campgroundSchema, reviewSchema } = require('./joiSchemas');

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

// app.use((req, res, next) => {
//     console.log("This is first middleware");
//     next();
// })
// app.use((req, res, next) => {
//     console.log("This is second middleware");
//     next();
// })

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error occured"));
db.once("open", () => {
  console.log("Connection Open");
});

const validateCampgroundSchema = (req, res, next) => {
  const {error} = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(err => err.message).join(',');
    throw new ExpressError(msg, 404);
  } else {
    next(); //Very important can not be skipped otherwise page will get stuck
  }
}

const validateReviewSchema = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(err => err.message).join(',');
    throw new ExpressError(msg, 404);
  } else {
    next();
  }
}

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/campgrounds", catchAsync(async (req, res) => {
  const campgrounds = await Campground.find();
  res.render("campgrounds/index", { campgrounds });
}));

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

app.get("/campgrounds/:id", catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id).populate('reviews');
  // console.log(campground);
  if (campground == null) {
    throw new ExpressError('Invalid campground id', 404);
  }
  res.render("campgrounds/show", { campground });
}));

app.post("/campgrounds", validateCampgroundSchema, catchAsync(async (req, res, next) => {
  const campground = new Campground(req.body.campground);
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
}));

app.get("/campgrounds/:id/edit", catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  res.render("campgrounds/edit", { campground });
}));

app.put("/campgrounds/:id", validateCampgroundSchema, catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, req.body.campground);
  res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete("/campgrounds/:id", catchAsync(async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect("/campgrounds");
}));

app.post("/campgrounds/:id/reviews", validateReviewSchema, catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
}))

app.delete("/campgrounds/:id/reviews/:reviewID", catchAsync(async (req, res)=>{
  const { id, reviewID } = req.params;
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewID } });
  await Review.findByIdAndDelete(reviewID);
  res.redirect(`/campgrounds/${id}`);
}))
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
