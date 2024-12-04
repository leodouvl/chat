// ConversationContext.js
import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';

const ConversationContext = createContext();

export const ConversationProvider = ({ children }) => {
  const [currentConversation, setCurrentConversation] = useState(null);
  const { socket } = useAuth();

  const startConversation = async (user1_id, user2_id, name1, name2) => {
    try {
      const response = await fetch(`http://localhost:3001/conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user1_id, user2_id, name1, name2 })
      });
      if (!response.ok) {
        console.error("Erreur lors de la requête :", response.statusText);
        return;
      }
  
      const conversation = await response.json();
      setCurrentConversation(conversation);
      socket.emit("newConversation", {
        senderId: user1_id,  
        recipientId: user2_id, 
        conversation, 
    });
    } catch (error) {
      console.error("Erreur lors de la récupération de la conversation :", error);
    }
  };
  
  return (
    <ConversationContext.Provider value={{ currentConversation, startConversation, setCurrentConversation }}>
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversation = () => useContext(ConversationContext);