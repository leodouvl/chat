import React, { useEffect, useState } from 'react';
import { AutoComplete } from 'antd';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useConversation } from '../context/ConversationContext';
import socketUser from '../service/socket';

const SearchUsers = () => {
  const [users, setUsers] = useState([]);
  const { auth } = useAuth();
  const { startConversation } = useConversation();

  // Écoute les nouveaux utilisateurs ajoutés via Socket.io
  useEffect(() => {
    socketUser.on("userAdded", (newUser) => {
      console.log(newUser)
      setUsers((prevUsers) => [
        ...prevUsers,
        { label: newUser.name, value: newUser.name, id: newUser._id },
      ]);
    });

    return () => {
      socketUser.off("userAdded");
    };
  }, []);

  // Recherche d'utilisateurs
  const onSearch = async (input) => {
    if (input) {
      try {
        const response = await axios.get('http://localhost:3001/searchUsers', {
          params: { 
            query: input, 
            userId: auth.userId,
          },
        });
        const filteredUsers = response.data.map(user => ({
          label: user.label,
          value: user.label,
          id: user.id,
        }));
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Erreur lors de la recherche d'utilisateurs :", error);
      }
    } else {
      setUsers([]); // Efface les résultats si la recherche est vide
    }
  };

  // Gestion de la sélection d'un utilisateur
  const onSelect = async (value) => {
    const foundUser = users.find(user => user.value === value);

    if (foundUser) {
      try {
        const response = await axios.get('http://localhost:3001/userName', {
          params: {
            userId: foundUser.id,
          },
        });
        startConversation(auth.userId, foundUser.id, auth.name, response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération username :", error);
      }
    }
  };

  return (
    <div>
      <AutoComplete
        style={{ width: 230 }}
        placeholder="Chercher un utilisateur"
        options={users} 
        onSelect={onSelect}
        onSearch={onSearch}
      />
    </div>
  );
};

export default SearchUsers;