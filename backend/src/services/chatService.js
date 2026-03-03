const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// Temporary in-memory stores
const conversations = [];
const messages = [];

const getConversations = async (user) => {
  return conversations.filter((c) => c.participantIds.includes(user.id));
};

const getMessages = async (user, conversationId) => {
  // In a real app, you would check membership
  return messages.filter((m) => String(m.conversationId) === String(conversationId));
};

const sendMessage = async (user, conversationId, payload) => {
  const message = new Message({
    id: messages.length + 1,
    conversationId,
    senderId: user.id,
    body: payload.body
  });
  messages.push(message);
  return message;
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage
};

