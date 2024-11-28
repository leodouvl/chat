const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

const router = express.Router();
const SECRET_KEY = 'secretxd';

module.exports = (database) => {
  const userModel = new User(database);

  router.post('/register', async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const result = await userModel.createUser({ name, email, password });
      res.status(201).json({ message: 'Utilisateur enregistré avec succès' });
    } catch (error) {
      res.status(400).json({ message: 'Erreur lors de l\'enregistrement de l\'utilisateur', error });
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await userModel.findUserByEmail(email);

      if (!user) {
        return res.status(400).json({ message: 'Utilisateur non trouvé' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Mot de passe incorrect' });
      }

      const token = jwt.sign({ userId: user._id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

      res.status(200).json({
        message: 'Connexion réussie',
        token,
        userName: user.name,
        userId: user._id.toString(),
        userConversations: user.conversations
      });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la connexion', error });
    }
  });

  router.get('/user/:email', async (req, res) => {
    try {
      const { email } = req.params;
      const user = await userModel.findUserByEmail(email);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur', error });
    }
  });

  return router;
};
