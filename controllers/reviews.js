const Campground = require("../models/campground");
const Review = require("../models/review");

module.exports.makeReview = async (req, res) => {
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
}

module.exports.deleteReview = async (req, res)=>{
  const { id, reviewID } = req.params;
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewID } });
  await Review.findByIdAndDelete(reviewID);
  req.flash('success', 'Successfully deleted review');
  res.redirect(`/campgrounds/${id}`);
}