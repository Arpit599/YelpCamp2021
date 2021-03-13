const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const {validateReviewSchema, isLoggedIn, isReviewAuthor} = require('../middleware');
const reviewsController = require('../controllers/reviews');

router.post("/reviews", isLoggedIn, validateReviewSchema, catchAsync(reviewsController.makeReview))

router.delete("/reviews/:reviewID", isLoggedIn, isReviewAuthor, catchAsync(reviewsController.deleteReview))

module.exports = router;