const express = require('express');
const chatController = require('../controllers/chatController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth);

router.get('/conversations', chatController.getConversations);
router.get('/conversations/:id/messages', chatController.getMessagesForConversation);
router.post('/conversations/:id/messages', chatController.sendMessage);

module.exports = router;

