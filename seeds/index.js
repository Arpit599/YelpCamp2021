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
    for (let i = 0; i < 20; i++){
        const price = Math.floor(Math.random() * 100);
        const newCampground = new Campground({
            location: `${sample(cities).city}, ${sample(cities).state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolor omnis magni officia libero aperiam quae aliquam? Explicabo vero a praesentium alias, quod delectus. Nobis ducimus corporis, modi velit veniam minima?',
            price: price,
            author: '60435e9a972bda528825019d'
        })
        await newCampground.save();
    }
}

seedDb().then(() => {
    mongoose.connection.close();
});