const mongoose = require('mongoose');
const roCities = require('./ro.json');
const { descriptors, places } = require('./seedHelper');
const Campground = require('../models/campground');

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
    for (let i = 0; i < 50; i++) {
        const randomRo = Math.floor(Math.random() * 270);
        const camp = new Campground({
            location: `${roCities[randomRo].city}, ${roCities[randomRo].country}`,
            title: `${name(descriptors)} ${name(places)}`
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})