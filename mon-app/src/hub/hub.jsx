import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import SearchUsers from '../component/search';
import { useConversation } from '../context/ConversationContext';
import { UserOutlined, MessageOutlined } from '@ant-design/icons';
import axios from 'axios';
import socket from '../service/socket';

function Hub() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const { Header, Content, Sider, Footer } = Layout;
  const { currentConversation } = useConversation();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [detailedConversations, setDetailedConversations] = useState([]);


  const getConversations = async () => {
    try {
      const response = await axios.get('http://localhost:3001/userConversation', {
        params: { userId: auth.userId } // Utilisation de `params` pour envoyer `userId` en tant que paramètre de requête
      });
      console.log(response.data);
      setDetailedConversations(response.data); // Mettre à jour l'état avec les conversations
    } catch (error) {
      console.error("Erreur lors de la récupération des conversations :", error);
    }
  };

useEffect(() => {
  // Écouter les conversations ajoutées
  socket.on("conversationAdded", (newConversation) => {
    console.log("Conversation ajoutée reçue :", newConversation);
    setDetailedConversations((prevConversation)=>[
        ...prevConversation,
        {newConversation},
    ]);
    
  });

  return () => {
    // Nettoyer l'écouteur
    socket.off("conversationAdded");
  };
}, []);

  
  useEffect(() => {
    getConversations();
  }, [currentConversation]);



  useEffect(() => {
    if (!auth.token) {
      navigate('/');
    }
  }, [auth.token, navigate]);

  if (!auth.token) {
    return null;
  }





const footerStyle = {
  textAlign: 'center',
  color: '#fff',
  backgroundColor: '#4096ff',
};

const headerStyle = {

};
const contentStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  maxHeight: '40vh',
  marginTop: '50px',
};

const siderStyle = {
  textAlign: 'center',
  lineHeight: '120px',
  color: '#fff',
  backgroundColor: '#1677ff',
};

const layoutStyle = {
  minHeight: '100vh',
  

};

const handleSelectConversation = (conversationId) => {
  setSelectedConversation(conversationId);
};

  return (
      <Layout style={layoutStyle}>
      <Header style={headerStyle}>
     <SearchUsers />
      </Header>
      <Layout>
        <Sider width="25%" style={siderStyle}>
        <Menu
          mode="inline"
          theme="light"
          onSelect={({ key }) => handleSelectConversation(key)}
          selectedKeys={[selectedConversation]} // Met en surbrillance la conversation sélectionnée
        >
          {detailedConversations?.map((conversation) => (
            <Menu.Item
              key={conversation._id} // Utilisez l'ID de la conversation comme clé
              icon={<MessageOutlined />}
            >
              {conversation.name1 !== auth.name ? conversation.name1 : conversation.name2}
            </Menu.Item>
          ))}
        </Menu>
        </Sider>
        <Content style={contentStyle}>
       
        </Content>
      </Layout>
      <Footer style={footerStyle}>
      <button onClick={logout}>Déconnexion</button>
      {auth.name}
      </Footer>
    </Layout>

  );
}


export default Hub;