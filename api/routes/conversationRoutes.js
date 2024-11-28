const express = require('express');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

module.exports = (database) => {
  const conversationModel = new Conversation(database);
  const userModel = new User(database);
  
  const router = express.Router();

  router.post('/conversation', async (req, res) => {
    try {
      const { user1_id, user2_id, name1, name2 } = req.body;
      const existingConversation = await conversationModel.getConversationByUsers(user1_id, user2_id);
      if (existingConversation) {
        return res.status(200).json(existingConversation);
      }

      const newConversation = await conversationModel.createConversation({ user1_id, user2_id, name1, name2 });
      
      await userModel.addConversation(user1_id, newConversation.insertedId);
      await userModel.addConversation(user2_id, newConversation.insertedId);

      res.status(201).json(newConversation);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la création de la conversation', error });
    }
  });

  router.get('/conversations/:user1_id/:user2_id', async (req, res) => {
    try {
      const { user1_id, user2_id } = req.params;
      const conversation = await conversationModel.getConversationByUsers(user1_id, user2_id);
      if (conversation) {
        res.status(200).json(conversation);
      } else {
        res.status(404).json({ message: 'Conversation non trouvée' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération de la conversation', error });
    }
  });

  router.post('/conversations/details', async (req, res) => {
    try {
      const { conversationIds } = req.body;
      const conversations = await conversationModel.getConversationsByIds(conversationIds);
      res.status(200).json(conversations);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des conversations', error });
    }
  });

  return router;
};
