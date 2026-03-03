class Message {
  constructor({ id, conversationId, senderId, body, createdAt }) {
    this.id = id;
    this.conversationId = conversationId;
    this.senderId = senderId;
    this.body = body;
    this.createdAt = createdAt || new Date();
  }
}

module.exports = Message;

