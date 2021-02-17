const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');


mongoose.connect('mongodb://localhost:27017/yelpcamp', {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error occured'));
db.once('open', () => {
    console.log("Connection Open");
})

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDb = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++){
        const newCampground = new Campground({
            location: `${sample(cities).city}, ${sample(cities).state}`,
            title: `${sample(descriptors)} ${sample(places)}`
        })
        await newCampground.save();
    }
}

seedDb().then(() => {
    mongoose.connection.close();
});