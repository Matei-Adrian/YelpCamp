const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const methodOverride = require('method-override');

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

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))

app.get('/', (req, res) => {
    res.render('home.ejs');
});

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index.ejs', { campgrounds });
});

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new.ejs');
});

app.post('/campgrounds', async (req, res) => {
    const addCampground = new Campground(req.body.campground);
    await addCampground.save();
    res.redirect(`/campgrounds/${addCampground._id}`);
});

app.get('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/show.ejs', { campground });
});

app.get('/campgrounds/:id/edit', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit.ejs', { campground });
});

app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const body = req.body.campground;
    const updateCampground = await Campground.findByIdAndUpdate(id, body, { new: true });
    res.redirect(`/campgrounds/${updateCampground._id}`);
});

app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})

app.listen(3000, () => {
    console.log('Listening to port 3000...');
});
