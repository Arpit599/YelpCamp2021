const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const campgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    images: [
        {
            url: String,
            filename: String
        }
    ],
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref:'Review'
        }
    ],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

campgroundSchema.post('findOneAndDelete', async (doc) => {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in:doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', campgroundSchema);