const chatService = require('../services/chatService');

const getConversations = async (req, res, next) => {
  try {
    const conversations = await chatService.getConversations(req.user);
    res.json(conversations);
  } catch (err) {
    next(err);
  }
};

const getMessagesForConversation = async (req, res, next) => {
  try {
    const messages = await chatService.getMessages(req.user, req.params.id);
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const message = await chatService.sendMessage(req.user, req.params.id, req.body);
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getConversations,
  getMessagesForConversation,
  sendMessage
};

