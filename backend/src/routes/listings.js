const express = require("express");
const {
  listListings,
  listFeaturedListings,
} = require("../controllers/listingController");

const router = express.Router();

router.get("/", listListings);
router.get("/featured", listFeaturedListings);

module.exports = router;
