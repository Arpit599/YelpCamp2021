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
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolor omnis magni officia libero aperiam quae aliquam? Explicabo vero a praesentium alias, quod delectus. Nobis ducimus corporis, modi velit veniam minima?',
            price: price,
            author: '60435e9a972bda528825019d',
            images: [
                        {
                        url: 'https://res.cloudinary.com/dzre5qhvl/image/upload/v1615804689/Yelpcamp/mzizqmr7f8dhzvv6sset.jpg',
                        filename: 'Yelpcamp/mzizqmr7f8dhzvv6sset'
                        },
                        {
                        url: 'https://res.cloudinary.com/dzre5qhvl/image/upload/v1615804692/Yelpcamp/t5jmhwwoj8qpgtkqttnc.jpg',
                        filename: 'Yelpcamp/t5jmhwwoj8qpgtkqttnc'
                        },
                        {
                        url: 'https://res.cloudinary.com/dzre5qhvl/image/upload/v1615804690/Yelpcamp/nxhqkwjxsvjwwmexds2a.jpg',
                        filename: 'Yelpcamp/nxhqkwjxsvjwwmexds2a'
                        }
                    ]
        })
        await newCampground.save();
    }
}

seedDb().then(() => {
    mongoose.connection.close();
});