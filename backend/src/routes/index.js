const express = require('express');

const authRoutes = require('./authRoutes');
const listingRoutes = require('./listingRoutes');
const chatRoutes = require('./chatRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const updateRoutes = require('./updateRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/listings', listingRoutes);
router.use('/chat', chatRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/update', updateRoutes);

module.exports = router;

