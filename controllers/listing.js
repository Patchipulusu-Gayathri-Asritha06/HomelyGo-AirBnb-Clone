const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geoCodingClient = mbxGeocoding({
    accessToken: mapToken
});

module.exports.index = async (req, res) => {
    const {
        sort,
        priceRange
    } = req.query;

    const {
        category,
        search
    } = req.query;

    console.log(req.query);

    let sortOption = {};
    let filter = {};

    if (sort) {
        if (sort === 'asc') {
            sortOption.price = 1; // ascending
        } else if (sort === 'desc') {
            sortOption.price = -1; // descending
        }
    }

    if (priceRange) {
        const [min, max] = priceRange.split('-').map(Number);
        console.log(min, max);
        filter.price = {
            $gte: min,
            $lte: max
        };
    }

    if (category) {
        filter.category = category;
    }

    if (search) {
        filter.$or = [{
                location: {
                    $regex: search,
                    $options: "i"
                }
            },
            {
                country: {
                    $regex: search,
                    $options: "i"
                }
            }
        ];
    }

    let allListings = await Listing.find(filter).sort(sortOption);
    // console.log(allListings);
    res.render("listings/index.ejs", {
        allListings
    });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.createListing = async (req, res, next) => {
    let response = await geoCodingClient.forwardGeocode({
            query: req.body.listing.location,
            limit: 1
        })
        .send();
    console.log(response.body.features[0].geometry);

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {
        url,
        filename
    };
    if (!response.body.features.length) {
        req.flash("error", "Invalid location provided");
        return res.redirect("/listings/new");
    }

    newListing.geometry = response.body.features[0].geometry;


    let savedListing = await newListing.save();
    console.log(savedListing);

    req.flash("success", "New Listing created");
    res.redirect("/listings");
};

module.exports.showListing = async (req, res, next) => {
    let {
        id
    } = req.params;
    let listing =
        await Listing.findById(id)
        .populate("owner")
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        });
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", {
        listing,
        MAP_TOKEN: process.env.MAP_TOKEN
    });
};

module.exports.renderEditForm = async (req, res, next) => {
    let {
        id
    } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    console.log(listing.image.url);
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_200,w_250");
    console.log(originalImageUrl);
    res.render("listings/edit.ejs", {
        listing,
        originalImageUrl
    });
};

module.exports.updateListing = async (req, res, next) => {
    let {
        id
    } = req.params;
    const updatedListing = await Listing.findByIdAndUpdate(id, req.body.listing, {
        new: true
    });

    if(!updatedListing){
        req.flash("error", "Listing you want to update does not exist");
        return res.redirect("/listings");
    }

    if (req.file) {
        const url = req.file.path;
        const filename = req.file.filename;
        updatedListing.image = {
            url,
            filename
        };
        console.log(req.file.path, req.file.filename);
        await updatedListing.save();
    }
    console.log(updatedListing);
    req.flash("success", "Listing updated");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res, next) => {
    let {
        id
    } = req.params;
    let result = await Listing.findByIdAndDelete(id);
    console.log(result);
    req.flash("success", "Listing deleted");
    res.redirect("/listings");
};