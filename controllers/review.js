const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");

module.exports.createReview = wrapAsync(async (req, res, next) => {
    let {
        id
    } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }

    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    console.log(newReview);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    console.log("New Review saved");
    req.flash("success", "New Review created");
    res.redirect(`/listings/${id}`);
});

module.exports.destroyReview = wrapAsync(async (req, res, next) => {
    let {
        id,
        reviewId
    } = req.params;
    await Review.findByIdAndDelete(reviewId);
    await Listing.findByIdAndUpdate(id, {
        $pull: {
            reviews: reviewId
        }
    });
    req.flash("success", "Review Deleted");
    res.redirect(`/listings/${id}`);
})