const express = require('express');
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const {isLoggedIn} = require('../middleware');
const {validateCampgroundSchema, isAuthor} = require('../middleware');
const campgroundController = require('../controllers/campgrounds');

router.get("/", catchAsync(campgroundController.renderAll));

router.get("/new", isLoggedIn, campgroundController.renderNewForm);

router.get("/:id", catchAsync(campgroundController.renderCampgroundWithID));

router.post("/", isLoggedIn,
  validateCampgroundSchema,
  catchAsync(campgroundController.createCampground));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgroundController.rederEditForm));

router.put("/:id", isLoggedIn, isAuthor,
  validateCampgroundSchema,
  catchAsync(campgroundController.updateCampground));

router.delete("/:id", isLoggedIn, isAuthor, catchAsync(campgroundController.deleteCampground));

module.exports = router;