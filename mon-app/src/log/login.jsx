import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useState } from 'react';
import { Button, Input, message as antdMessage } from 'antd';
import 'antd/dist/reset.css';
import { useAuth } from '../context/AuthContext';

function LogForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validation des champs
    if (!email || !password) {
      antdMessage.error('Veuillez remplir tous les champs.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/login', {
        email,
        password,
      });
      const { token, message, userName, userId, userConversations } = response.data;

      antdMessage.success(message); // Notification utilisateur
      login(token, email, userName, userId, userConversations); // Mettre à jour le contexte
      navigate('/hub'); // Rediriger vers le hub après connexion réussie
    } catch (error) {
      antdMessage.error('Erreur lors de la connexion de l\'utilisateur.');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: 'auto' }}>
      <form onSubmit={handleSubmit}>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          <li style={{ marginBottom: '1rem' }}>
            <label htmlFor="mail">E-mail :</label>
            <Input
              type="email"
              id="mail"
              name="user_mail"
              placeholder="Entrez votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </li>
          <li style={{ marginBottom: '1rem' }}>
            <label htmlFor="password">Mot de passe :</label>
            <Input.Password
              id="password"
              name="user_password"
              placeholder="Entrez votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </li>
          <li>
            <Button htmlType="submit" type="primary" block>
              Connexion
            </Button>
          </li>
        </ul>
      </form>
    </div>
  );
}

export default LogForm;
