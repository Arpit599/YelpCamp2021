const express = require('express');
const router = express.Router();

const catchAsync = require("../utils/catchAsync");
const ExpressError = require('../utils/ExpressError');

const { campgroundSchema } = require('../joiSchemas');

const Campground = require("../models/campground");

const validateCampgroundSchema = (req, res, next) => {
  const {error} = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(err => err.message).join(',');
    throw new ExpressError(msg, 404);
  } else {
    next(); //Very important can not be skipped otherwise page will get stuck
  }
}

router.get("/", catchAsync(async (req, res) => {
  const campgrounds = await Campground.find();
  res.render("campgrounds/index", { campgrounds });
}));

router.get("/:id", catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id).populate('reviews');
  // console.log(campground);
  if (campground == null) {
    throw new ExpressError('Invalid campground id', 404);
  }
  res.render("campgrounds/show", { campground });
}));

router.get("/new", (req, res) => {
  res.render("campgrounds/new");
});

router.post("/", validateCampgroundSchema, catchAsync(async (req, res, next) => {
  const campground = new Campground(req.body.campground);
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
}));

router.get("/:id/edit", catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  res.render("campgrounds/edit", { campground });
}));

router.put("/:id", validateCampgroundSchema, catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, req.body.campground);
  res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete("/:id", catchAsync(async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect("/campgrounds");
}));

module.exports = router;