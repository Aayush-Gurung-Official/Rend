const express = require('express');
const listingController = require('../controllers/listingController');
const { requireAuth } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.get('/', listingController.getAllListings);
router.get('/:id', listingController.getListingById);
router.post('/', requireAuth, validateRequest('createListing'), listingController.createListing);
router.put('/:id', requireAuth, validateRequest('updateListing'), listingController.updateListing);
router.delete('/:id', requireAuth, listingController.deleteListing);

module.exports = router;

