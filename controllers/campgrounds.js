const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index.ejs', { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new.ejs');
};

module.exports.createCampground = async (req, res) => {
    const addCampground = new Campground(req.body.campground);
    addCampground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    addCampground.author = req.user._id;
    await addCampground.save();

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
    const { id } = req.params;
    const body = req.body.campground;
    const updateCampground = await Campground.findByIdAndUpdate(id, body, { new: true });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    updateCampground.images.push(...imgs);
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

module.exports.delelteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
};