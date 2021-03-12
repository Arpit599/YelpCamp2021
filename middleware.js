const ExpressError = require('./utils/ExpressError');
const { campgroundSchema, reviewSchema } = require('./joiSchemas');
const Campground = require('./models/campground');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // console.log(req.path, req.originalUrl);
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

module.exports.validateCampgroundSchema = (req, res, next) => {
  const {error} = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(err => err.message).join(',');
    throw new ExpressError(msg, 404);
  } else {
    next(); //Very important can not be skipped otherwise page will get stuck
  }
}

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
   if (!campground.author._id.equals(req.user._id)) {
    req.flash('error', 'You do not have permission to do this');
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
}

module.exports.validateReviewSchema = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(err => err.message).join(',');
    throw new ExpressError(msg, 404);
  } else {
    next();
  }
}

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewID } = req.params;
  const review = await Review.findById(reviewID);
   if (!review.author._id.equals(req.user._id)) {
    req.flash('error', 'You do not have permission to do this');
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
}