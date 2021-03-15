const express = require('express');
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const {isLoggedIn} = require('../middleware');
const {validateCampgroundSchema, isAuthor} = require('../middleware');
const campgroundController = require('../controllers/campgrounds');
const { storage } = require('../cloudinary/index');
const multer  = require('multer')
const upload = multer({ storage })

router.route("/")
  .get(catchAsync(campgroundController.renderAll))
  .post(isLoggedIn, upload.array('campground[images]'), validateCampgroundSchema, catchAsync(campgroundController.createCampground));
  // .post(upload.array('campground[image]'), (req, res) => {
  //   console.log(req.files, req.body);
  //   res.send("I guess it worked");
  // })

router.get("/new", isLoggedIn, campgroundController.renderNewForm);

router.route("/:id")
  .get(catchAsync(campgroundController.renderCampgroundWithID))
  .put(isLoggedIn, isAuthor, upload.array('campground[images]'), catchAsync(campgroundController.updateCampground))
  .delete(isLoggedIn, isAuthor, catchAsync(campgroundController.deleteCampground));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgroundController.rederEditForm));

module.exports = router;