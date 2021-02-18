const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const app = express();
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

mongoose.connect('mongodb://localhost:27017/yelpcamp', {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);

// app.use((req, res, next) => {
//     console.log("This is first middleware");
//     next();
// })
// app.use((req, res, next) => {
//     console.log("This is second middleware");
//     next();
// })

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error occured'));
db.once('open', () => {
    console.log("Connection Open");
})

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', {campgrounds});
})

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { campground });
})

app.post('/campgrounds', async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
})

app.get('/campgrounds/:id/edit', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit', {campground});
})

app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground);
    res.redirect(`/campgrounds/${campground._id}`);
})

app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})

app.listen(8000, (req, res) => {
    console.log("SERVER IS WORKING AT 8000");
})