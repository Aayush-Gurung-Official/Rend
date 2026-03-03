const express = require('express');
const updateController = require('../controllers/updateController');
const { requireAuth } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.use(requireAuth);

router.put('/profile', validateRequest('updateProfile'), updateController.updateProfile);
router.put('/listing/:id', validateRequest('updateListing'), updateController.updateListing);

module.exports = router;

