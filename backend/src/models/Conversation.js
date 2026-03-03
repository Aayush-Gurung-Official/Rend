class Conversation {
  constructor({ id, participantIds, lastMessageAt }) {
    this.id = id;
    this.participantIds = participantIds;
    this.lastMessageAt = lastMessageAt || new Date();
  }
}

module.exports = Conversation;

