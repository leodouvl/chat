import React from 'react';
import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Layout, Card } from 'antd';
import socket from '../service/socket';




function SubForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { setIsRegistered } = useAuth();
  const {Content } = Layout;






  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/register', {
        name,
        email,
        password
      });
      setMessage(response.data.message);
      setIsRegistered(true);
      socket.emit("newUser", { name, email });
    } catch (error) {
      setMessage('Erreur lors de l\'enregistrement de l\'utilisateur');
      console.error(error);
    }
  };


  const contentStyle = {
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    lineHeight: '120px',
  };

  const layoutStyle = {
    borderRadius: 8,
    overflow: 'hidden',
    width: 'calc(50% - 8px)',
    maxWidth: 'calc(50% - 8px)',
  };

  return (
    <Layout style={layoutStyle}>
      <Content style={contentStyle}>
      <Card title="Inscription" style={{ width: 300 }}>
     
      <form onSubmit={handleSubmit}>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
           <li>
            <label>Prénom&nbsp;:</label>
            <input
              id="name"
              name="user_name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </li>
          <li>
            <label htmlFor="mail">E-mail&nbsp;:</label>
            <input
              type="email"
              id="mail"
              name="user_mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </li>
          <li>
            <label htmlFor="password">Mot de passe&nbsp;:</label>
            <input
              type="password"
              id="password"
              name="user_password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </li>
          <li>
            <button type="submit">S'inscrire</button>
          </li>
        </ul>
      </form>
      {message && <p>{message}</p>}
      
    </Card>

      </Content>
    </Layout>
    

    
  );
}

export default SubForm;