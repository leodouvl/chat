import React, { useState, useEffect, useRef } from 'react';
import { Layout, Input, Card } from 'antd';
import axios from 'axios';
import { useConversation } from '../context/ConversationContext';
import { useAuth } from '../context/AuthContext';

const Chat = () => {
  const [inputValue, setInputValue] = useState('');
  const { Header, Footer, Content } = Layout;
  const { currentConversation } = useConversation();
  const { auth, socket } = useAuth();
  const [receiver, setReceiver] = useState('');
  const [messages, setMessages] = useState([]);

  // Référence pour le conteneur des messages
  const contentRef = useRef(null);

  useEffect(() => {
    setReceiver(
      currentConversation.user1_id === auth.userId
        ? currentConversation.user2_id
        : currentConversation.user1_id
    );
    setMessages(currentConversation.messages);
  }, [currentConversation]);

  useEffect(() => {
    console.log(socket);
    socket.on('messageAdded', (newMessage) => {
      console.log('Message ajouté reçu :', newMessage);
      setMessages((prevMessages) => {
        console.log('Ancien état des messages :', prevMessages);
        return [...prevMessages, newMessage];
      });
    });

    return () => {
      socket.off('messageAdded');
    };
  }, []);

  const headerStyle = {
    textAlign: 'center',
    color: '#fff',
    height: '64px',
    lineHeight: '64px',
    backgroundColor: '#4096ff',
  };

  const contentStyle = {
    flexGrow: 1, // Permet à la zone de contenu de remplir tout l'espace disponible
    textAlign: 'center',
    color: '#fff',
    backgroundImage: 'url(/mar.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    overflowY: 'auto', // Permet de défiler les messages
    padding: '10px',
    height: 'calc(100vh - 128px)', // Assurez-vous que le contenu prend toute la hauteur disponible en tenant compte du Header et du Footer
  };

  const footerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0',
    color: '#fff',
    height: '64px',
    backgroundColor: 'red',
  };

  const layoutStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
  };

  const inputStyle = {
    width: '100%',
    height: '100%',
  };

  // Défilement automatique lorsque de nouveaux messages arrivent
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [messages]);

  const onPressEnter = async () => {
    try {
      const res = await axios.post('http://localhost:3001/message', {
        conversation: currentConversation,
        inputValue,
        sender: auth.userId,
        receiver: receiver,
      });
      socket.emit('newMessage', {
        message: res.data.newMessage.message,
        sender: res.data.newMessage.sender,
        receiver: res.data.newMessage.receiver,
        createdAt: res.data.newMessage.createdAt,
      });
      setInputValue('');
    } catch (error) {
      console.error('Erreur lors de l\'insertion du message :', error);
    }
  };

  // Fonction pour formater la date de création d'un message
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getHours()}:${date.getMinutes()} ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  console.log(messages);

  return (
    <Layout style={layoutStyle}>
      <Header style={headerStyle}>Chat</Header>
      <Content ref={contentRef} style={contentStyle}>
        {messages?.map((message, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: message.sender === auth.userId ? 'flex-end' : 'flex-start', // Alignement à droite ou à gauche
              width: '100%',
              marginBottom: '10px',
            }}
          >
            <Card
              title={message.sender === auth.userId ? 'Vous' : 'Recepteur'}
              bordered={false}
              style={{
                backgroundColor: message.sender === auth.userId ? '#a8d8ff' : '#f0f0f0',
                borderRadius: '8px',
                maxWidth: '80%',
                padding: '10px',
              }}
            >
              <p>{message.message}</p>
              <small>{formatDate(message.createdAt)}</small>
            </Card>
          </div>
        ))}
      </Content>
      <Footer style={footerStyle}>
        <Input
          style={inputStyle}
          placeholder="Envoyer un message"
          onPressEnter={onPressEnter}
          onChange={(e) => setInputValue(e.target.value)}
          value={inputValue}
        />
      </Footer>
    </Layout>
  );
};

export default Chat;
