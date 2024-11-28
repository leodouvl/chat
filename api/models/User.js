const { ObjectId } = require('mongodb');

class User {
  constructor(database) {
    this.collection = database.collection('users');
  }

  async createUser({ name, email, password, conversations = [] }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { name, email, password: hashedPassword, conversations };
    return await this.collection.insertOne(newUser);
  }

  async findUserByEmail(email) {
    return await this.collection.findOne({ email });
  }

  async findUserById(userId) {
    return await this.collection.findOne({ _id: new ObjectId(userId) });
  }

  async addConversation(userId, conversationId) {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(userId) },
      { $addToSet: { conversations: new ObjectId(conversationId) } }
    );
    return result;
  }

  async getUserConversations(userId) {
    return await this.collection.findOne({ _id: new ObjectId(userId) }, { projection: { conversations: 1 } });
  }
}

module.exports = User;