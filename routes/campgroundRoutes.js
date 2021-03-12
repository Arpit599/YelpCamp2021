const express = require('express');
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const {isLoggedIn} = require('../middleware');
const {validateCampgroundSchema, isAuthor} = require('../middleware');


router.get("/", catchAsync(async (req, res) => {
  const campgrounds = await Campground.find();
  res.render("campgrounds/index", { campgrounds });
}));

router.get("/new", isLoggedIn, (req, res) => {
  res.render("campgrounds/new");
});

router.get("/:id", catchAsync(async (req, res) => {
  const campground = await (await Campground.findById(req.params.id).populate(
    {
      path: 'reviews',
      populate: {
        path: 'author'
      }
    }
  ).populate('author'));
  //console.log(campground);
  if (campground == null) {
    // throw new ExpressError('Invalid campground id', 404);
    req.flash('error', 'Cannot find requested campground');
    //return statement is necessary otherwise two responses will be sent and node will throw error
    return res.redirect('/campgrounds');
  }
 
  res.render("campgrounds/show", { campground });
}));

router.post("/", isLoggedIn, validateCampgroundSchema, catchAsync(async (req, res, next) => {
  const campground = new Campground(req.body.campground);
  campground.author = req.user._id;
  // console.log(req.user._id);
  // console.log(campground);
  await campground.save();
  req.flash('success', 'Successfully created campground');
  res.redirect(`/campgrounds/${campground._id}`);
}));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (campground == null) {
    req.flash('error', 'Cannot find requested campground');
    return res.redirect('/campgrounds');
  }
  res.render("campgrounds/edit", { campground });
}));

router.put("/:id", isLoggedIn, isAuthor, validateCampgroundSchema, catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, req.body.campground);
  req.flash('success', 'Successfully updated campground');
  res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete("/:id", isLoggedIn, isAuthor, catchAsync(async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash('success', 'Successfully deleted campground');
  res.redirect("/campgrounds");
}));

module.exports = router;