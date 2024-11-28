import React, { createContext, useState, useContext, useEffect } from 'react';
import { io } from 'socket.io-client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const savedAuth = localStorage.getItem('auth');
    return savedAuth ? JSON.parse(savedAuth) : { token: null, email: null, name: null, userId: null, userConversations: null };
  });

  const [isRegistered, setIsRegistered] = useState(false);

  // État pour le WebSocket
  const [socket, setSocket] = useState(null);

  // Sauvegarder l'état d'authentification dans localStorage à chaque mise à jour
  useEffect(() => {
    if (auth.token) {
      localStorage.setItem('auth', JSON.stringify(auth));
    } else {
      localStorage.removeItem('auth'); // Supprimer si déconnecté
    }
  }, [auth]);

  // Initialiser la connexion WebSocket lorsque l'utilisateur se connecte
  useEffect(() => {
    if (auth.token) {
      const newSocket = io('http://localhost:3001', {
        auth: { token: auth.token }, // Envoyer le token pour l'authentification
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('WebSocket connecté avec ID :', newSocket.id);
      });

      newSocket.on('disconnect', () => {
        console.log('WebSocket déconnecté');
      });

      return () => {
        newSocket.close(); // Nettoyer la connexion lorsque le composant est démonté
      };
    }
  }, [auth.token]);

  const login = (token, email, name, userId, userConversations) => {
    setAuth({ token, email, name, userId, userConversations });
  };

  const logout = () => {
    setAuth({ token: null, email: null, name: null, userId: null, userConversations: null });
    localStorage.removeItem('auth');
    if (socket) {
      socket.close(); // Déconnecter le WebSocket à la déconnexion
      setSocket(null);
    }
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, isRegistered, setIsRegistered, socket }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);