const express = require("express");
const router = express.Router({
    mergeParams: true
});
const {
    isLoggedIn,
    validateReview,
    isReviewAuthor
} = require("../middleware.js");
const reviewController = require("../controllers/review.js");

// Reviews

// Post Review Route
router.post("/", validateReview, isLoggedIn, reviewController.createReview);

// Delete Review Route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, reviewController.destroyReview);

module.exports = router;