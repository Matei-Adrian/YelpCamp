const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

const { cloudinary } = require('../cloudinary');

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports.index = async (req, res) => {
    const { search } = req.query;
    if(!search){
        const campgrounds = await Campground.find({});
        const noMatch = 0;
        res.render('campgrounds/index.ejs', { campgrounds, noMatch });
    } else {
        const regex = new RegExp(escapeRegex(search), 'gi');
        const campgrounds = await Campground.find({ title : regex});
        let noMatch = 0;
        if(campgrounds.length < 1) {
            noMatch = 1;
        }
        res.render('campgrounds/index.ejs', { campgrounds, noMatch });
    }
};

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new.ejs');
};

module.exports.createCampground = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const addCampground = new Campground(req.body.campground);
    addCampground.geometry = geoData.body.features[0].geometry;
    addCampground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    if (addCampground.images.length === 0) {
        addCampground.images.push({
            url: 'https://res.cloudinary.com/yelp-camp2/image/upload/v1621769630/YelpCamp/k6jnqpevsexljgvgwz7a.jpg',
            filename: 'YelpCamp/zwahz9paf5xtcm2qh2n4'
        });
    }
    addCampground.author = req.user._id;
    await addCampground.save();
    console.log(addCampground)
    req.flash('success', 'Successfully made a new campgroun!');
    res.redirect(`/campgrounds/${addCampground._id}`);     
};

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show.ejs', { campground });
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit.ejs', { campground });
};

module.exports.updateCampground = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const { id } = req.params;
    const body = req.body.campground;
    const updateCampground = await Campground.findByIdAndUpdate(id, body, { new: true });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    updateCampground.images.push(...imgs);
    updateCampground.geometry = geoData.body.features[0].geometry;
    await updateCampground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await updateCampground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } }, { new: true });
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${updateCampground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
};