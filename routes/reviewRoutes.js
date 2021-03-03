const express = require('express');
const router = express.Router({ mergeParams: true });

const catchAsync = require("../utils/catchAsync");
const ExpressError = require('../utils/ExpressError');

const { reviewSchema } = require('../joiSchemas');

const Campground = require("../models/campground");
const Review = require("../models/review");


const validateReviewSchema = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(err => err.message).join(',');
    throw new ExpressError(msg, 404);
  } else {
    next();
  }
}

router.post("/reviews", validateReviewSchema, catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash('success', 'Successfully added review');
  res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete("/reviews/:reviewID", catchAsync(async (req, res)=>{
  const { id, reviewID } = req.params;
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewID } });
  await Review.findByIdAndDelete(reviewID);
  req.flash('success', 'Successfully deleted review');
  res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;