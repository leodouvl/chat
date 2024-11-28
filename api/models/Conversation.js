class Conversation {
    constructor(database) {
      this.collection = database.collection('conversations');
    }
  
    async createConversation({ user1_id, user2_id, name1, name2 }) {
      const newConversation = {
        user1_id,
        user2_id,
        name1,
        name2,
        createdAt: new Date(),
        messages: []
      };
      return await this.collection.insertOne(newConversation);
    }
  
    async getConversationByUsers(user1_id, user2_id) {
      return await this.collection.findOne({
        $or: [
          { user1_id, user2_id },
          { user1_id: user2_id, user2_id: user1_id }
        ]
      });
    }
  
    async getConversationsByIds(conversationIds) {
      const parsedIds = conversationIds.map(id => new ObjectId(id));
      return await this.collection.find({ _id: { $in: parsedIds } }).toArray();
    }
  }
  
  module.exports = Conversation;