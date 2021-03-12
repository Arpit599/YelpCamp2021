const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");

const Campground = require("../models/campground");
const Review = require("../models/review");
const {validateReviewSchema, isLoggedIn, isReviewAuthor} = require('../middleware');

router.post("/reviews", isLoggedIn, validateReviewSchema, catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  campground.reviews.push(review);
  review.author = req.user._id;
  await review.save();
  await campground.save();
  console.log(review);
  console.log(campground);
  req.flash('success', 'Successfully added review');
  res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete("/reviews/:reviewID", isLoggedIn, isReviewAuthor, catchAsync(async (req, res)=>{
  const { id, reviewID } = req.params;
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewID } });
  await Review.findByIdAndDelete(reviewID);
  req.flash('success', 'Successfully deleted review');
  res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;