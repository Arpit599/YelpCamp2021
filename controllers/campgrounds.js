const Campground = require("../models/campground");
// Express automatically looks for the index.js file by default, therefore no need to specify the index.js
const { cloudinary } = require("../cloudinary");
const mbxGeoCoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geoCoder = mbxGeoCoding({ accessToken: process.env.MAPBOX_TOKEN });

module.exports.renderAll = async (req, res) => {
  const campgrounds = await Campground.find();
  res.render("campgrounds/index", { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
}

module.exports.renderCampgroundWithID = async (req, res) => {
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
}

module.exports.createCampground = async (req, res, next) => {
  const geoData = await geoCoder.forwardGeocode({
    query: req.body.campground.location,
    limit: 1
  }).send();
  
  // res.send(geoData.body.features[0].geometry.coordinates);
  // console.log(geoData.body.features[0].center);

  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.body.features[0].geometry;
  campground.author = req.user._id;
  campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
  // console.log(req.user._id);
  // console.log(req.files);
  // console.log(campground);
  await campground.save();
  req.flash('success', 'Successfully created campground');
  res.redirect(`/campgrounds/${campground._id}`);
 }

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (campground == null) {
    req.flash('error', 'Cannot find requested campground');
    return res.redirect('/campgrounds');
  }
  res.render("campgrounds/edit", { campground });
}

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  // console.log(req.body);
  const campground = await Campground.findByIdAndUpdate(id, req.body.campground);
  const newImagesArray = req.files.map(f => ({ url: f.path, filename: f.filename }));
  campground.images.push(...newImagesArray);
  await campground.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({$pull: { images: { filename: {$in: req.body.deleteImages}}}})
  }
  req.flash('success', 'Successfully updated campground');
  res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash('success', 'Successfully deleted campground');
  res.redirect("/campgrounds");
}