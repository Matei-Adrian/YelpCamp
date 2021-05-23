const mongoose = require('mongoose');
const roCities = require('./ro.json');
const { descriptors, places } = require('./seedHelper');
const Campground = require('../models/campground');
const Review = require('../models/review');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Connected to DB');
});

const name = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
}

const seedDB = async () => {
    await Campground.deleteMany({});
    await Review.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const randomRo = Math.floor(Math.random() * 270);
        const price = Math.floor(Math.random() * 30) + 20;
        const camp = new Campground({
            author: '609bff1b9713bd2368ee32ff',
            location: `${roCities[randomRo].city}, ${roCities[randomRo].country}`,
            title: `${name(descriptors)} ${name(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Totam, repellat doloribus error sint natus ut, quasi qui officia iure corporis animi voluptatibus nisi nulla, amet voluptatem commodi! Nisi, corporis fugiat?',
            price,
            images: [
                {
                    url: 'https://res.cloudinary.com/yelp-camp2/image/upload/v1621769630/YelpCamp/k6jnqpevsexljgvgwz7a.jpg',
                    filename: 'YelpCamp/zwahz9paf5xtcm2qh2n4'
                },
                {
                    url: 'https://res.cloudinary.com/yelp-camp2/image/upload/v1621765584/YelpCamp/rabcpgchy88d5ymzrp4a.jpg',
                    filename: 'YelpCamp/reutrwwraiy5rxckm37y'
                }
            ],
            geometry: {
                type: 'Point',
                coordinates: [
                    roCities[randomRo].lng,
                    roCities[randomRo].lat
                ]
            }
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})