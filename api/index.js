var express = require("express");
var MongoClient = require("mongodb").MongoClient;
var cors = require("cors");
const socket = require("socket.io");
const { Server } = require('socket.io');


var app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json()); // Middleware pour analyser les requêtes JSON

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');


var CONNECTION_STRING = "mongodb+srv://lio:mongodb@cluster0.a2jnaff.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
var DATABASE_NAME = "projetdb";
var database;




// Connexion à MongoDB
MongoClient.connect(CONNECTION_STRING)
  .then(client => {
    console.log("Connexion à MongoDB réussie");
    database = client.db(DATABASE_NAME);

      // Suppression des documents
/*const deleteAllDocuments = async () => {
  try {
    const messagesCollection = database.collection('messages');
    messagesCollection.deleteMany({});
    console.log('Tous les documents ont été supprimés.');
  } catch (error) {
    console.error('Erreur lors de la suppression des documents:', error);
  }
};

 deleteAllDocuments();*/

    // Création du serveur HTTP et intégration de socket.io
    const http = require("http");
    const server = http.createServer(app); // Crée un serveur HTTP avec Express
    const io = new Server(server, {
      cors: {
        origin: 'http://localhost:3000', // Autorise l'origine frontend
        methods: ['GET', 'POST'],
      },
    });

    io.on("connection", (socket) => {
      console.log("Un client est connecté :", socket.id);
      socket.on("setUserId", (userId) => {
        console.log("client :", userId)
        socket.userId = userId; // Enregistre l'ID de l'utilisateur
      });
    
    
      // Écouter l'événement 'newUser'
      socket.on("newUser", (user) => {
        console.log("Nouvel utilisateur enregistré :", user);
    
        // Notifier tous les autres clients d'un nouvel utilisateur
        socket.broadcast.emit("userAdded", user);
      });


      socket.on("newConversation", ({ senderId, recipientId, conversation }) => {
        console.log("Nouvelle conversation entre :", senderId, "et", recipientId);
    

        // Trouve les sockets correspondants aux deux utilisateurs
        const recipientSocket = Array.from(io.sockets.sockets.values()).find(
            (s) => s.userId === recipientId
        );

        const senderSocket = Array.from(io.sockets.sockets.values()).find(
            (s) => s.userId === senderId
        );

        if (recipientSocket) {
            // Notifie le destinataire de la conversation
            recipientSocket.emit("conversationAdded", { from: senderId, conversation });
        }

        if (senderSocket && senderSocket.id !== socket.id) {
            // Notifie l'expéditeur uniquement s'il est sur un autre socket
            senderSocket.emit("conversationAdded", { to: recipientId, conversation });
        }
    });

    socket.on("newMessage", ({ message, sender, receiver, createdAt }) => {
      console.log("Nouveau message reçu :", message);
      console.log("crée a : ", createdAt);
    
      // Récupère toutes les sockets connectées
      const allSockets = Array.from(io.sockets.sockets.values());
      console.log("Liste complète des sockets connectées :");
      allSockets.forEach((s, index) => {
        console.log(`Socket ${index + 1}: ID=${s.id}, userId=${s.userId}`);
      });
    
      // Trouve la socket du destinataire (receiver)
      const recipientSocket = allSockets.find(
        (s) => s.userId === receiver
      );
    
      // Trouve la socket de l'expéditeur (sender)
      const senderSocket = allSockets.find(
        (s) => s.userId === sender
      );
    
      console.log("Résultat de la recherche des sockets :");
      console.log("Socket du destinataire :", receiver ? `ID=${recipientSocket?.id}, userId=${recipientSocket?.userId}` : "Non trouvé");
      console.log("Socket de l'expéditeur :", sender ? `ID=${senderSocket?.id}, userId=${senderSocket?.userId}` : "Non trouvé");
    
      if (!recipientSocket) {
        console.log(`Le destinataire (userId: ${receiver}) n'est pas connecté.`);
      } else {
        recipientSocket.emit("messageAdded", { from: sender, message, sender, receiver, createdAt });
        console.log(`Message envoyé au destinataire connecté (userId: ${receiver}).`);
      }
    
      if (senderSocket) {
        // Notifie l'expéditeur uniquement s'il est sur un autre socket
        senderSocket.emit("messageAdded", { to: receiver, message, sender, receiver, createdAt });
        console.log("Message renvoyé à l'expéditeur :", sender);
      } else if (!senderSocket) {
        console.log("Socket de l'expéditeur non trouvée pour userId :", sender);
      }
    });
    
    
      socket.on("disconnect", () => {
        console.log("Un client s'est déconnecté : ", socket.id);
      });
    });
    // Démarrer le serveur
    const port = 3001;
    server.listen(port, () => {
      console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error("Erreur de connexion à MongoDB", err);
  });






// Route pour enregistrer un nouvel utilisateur
app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const conversations = [];
    const hashedPassword = await bcrypt.hash(password, 10);
    const usersCollection = database.collection('users');
    const newUser = { name, email, password: hashedPassword, conversations };
    await usersCollection.insertOne(newUser);
    res.status(201).json({ message: 'Utilisateur enregistré avec succès' });
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de l\'enregistrement de l\'utilisateur', error });
  }
}); 

async function addConversationToUser(userId, conversationId, usersCollection) {
  try {
    // Vérification si les IDs sont des chaînes (si oui, convertissez-les en ObjectId)
    const userObjectId = (typeof userId === 'string') ? new ObjectId(userId) : userId;
    const conversationObjectId = (typeof conversationId === 'string') ? new ObjectId(conversationId) : conversationId;

    // Mise à jour de l'utilisateur pour ajouter la conversation
    const result = await usersCollection.updateOne(
      { _id: userObjectId },  // Assurez-vous que userId est un ObjectId
      { $addToSet: { conversations: conversationObjectId } } // Ajouter la conversation sans doublon
    );

    // Vérification si l'utilisateur a été modifié
    if (result.modifiedCount === 0) {
      return { success: false, message: "Utilisateur non trouvé ou conversation déjà ajoutée" };
    }

    return { success: true, message: "Conversation ajoutée avec succès" };
  } catch (error) {
    console.error("Erreur lors de l'ajout de la conversation :", error);
    return { success: false, message: "Erreur lors de l'ajout de la conversation", error };
  }
}

app.post('/message', async (req, res) => {
  try {
    const { conversation, inputValue, sender, receiver } = req.body; 
    console.log(conversation._id)
    const conversationsCollection = database.collection('conversations');
    const messagesCollection = database.collection('messages');


    const newMessage = { message: inputValue, 
                         sender: sender, 
                         receiver: receiver, 
                         createdAt: new Date() };

    await messagesCollection.insertOne(newMessage);

    
    const parsedId = new ObjectId(conversation._id);
 
    const result = await conversationsCollection.updateOne(
      { _id: parsedId }, // Recherche par l'ID
      { $addToSet: { messages: newMessage } } // Ajout du message à un tableau appelé "messages"
    );
 

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'Conversation non trouvée' });
    }

    if (result.modifiedCount === 0) {
      return res.status(400).json({ success: false, message: 'Message déjà existant ou aucun changement effectué' });
    }

    return res.status(200).json({ newMessage:newMessage, success: true, message: 'Message ajouté avec succès' });
  } catch (error) {
    console.error("Erreur lors de l'ajout du message :", error);
    res.status(500).json({ success: false, message: "Erreur lors de l'insertion du message", error });
  }
});

  


app.post('/conversation/', async (req, res) => {
  try {
    const { user1_id, user2_id, name1, name2 } = req.body;

    // Vérification des données
    if (!user1_id || !user2_id) {
      return res.status(400).json({ message: "Les champs user1_id et user2_id sont requis." });
    }

    const conversationsCollection = database.collection('conversations');
    const usersCollection = database.collection('users');

    // Vérifier si une conversation existe déjà
    const existingConversation = await checkConversationExists(user1_id, user2_id, conversationsCollection);

    if (existingConversation) {
      return res.status(200).json(existingConversation);
    }

    // Création d'une nouvelle conversation
    const newConversation = {
      user1_id,
      user2_id,
      name1,
      name2,
      createdAt: new Date(),
      messages: [] 
    };

    const result = await conversationsCollection.insertOne(newConversation);
    
    

    // Ajouter l'ID de la conversation aux deux utilisateurs concernés
    const conversationId = result.insertedId.toString(); // Assure que l'ID est au bon format
    const addUser1 = await addConversationToUser(user1_id, conversationId, usersCollection);
    const addUser2 = await addConversationToUser(user2_id, conversationId, usersCollection);

    // Vérifier si l'ajout a réussi pour les deux utilisateurs
    if (!addUser1.success || !addUser2.success) {
      return res.status(500).json({
        message: "La conversation a été créée, mais l'ajout aux utilisateurs a échoué.",
        addUser1,
      });
    }

    // Tout s'est bien passé
    res.status(201).json(newConversation);

  } catch (error) {
    console.error("Erreur lors de la création de la conversation :", error);
    res.status(500).json({ message: 'Erreur lors de la création de la conversation', error });
  }
});


const SECRET_KEY = 'secretxd';

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Récupérer la collection des utilisateurs
    const usersCollection = database.collection('users');
    

    // Rechercher l'utilisateur par email
    const user = await usersCollection.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: 'Utilisateur non trouvé' });j
    }

    // Vérifier si le mot de passe correspond (comparer avec bcrypt)
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
      
    }

    // Créer un token JWT avec l'identifiant de l'utilisateur
    const token = jwt.sign({ userId: user._id, email: user.email }, SECRET_KEY, {
      expiresIn: '1h',  // Le token expire après 1 heure
    });

    const userId = user._id.toString();
    const userName = user.name;
    const userConversations = user.conversations;

    // Envoyer le token et le message de succès
    res.status(200).json({
      message: 'Connexion réussie',
      token,
      userName,
      userId,
      userConversations,
    });


  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la connexion de l\'utilisateur',
      error,
    });
  }
});



// Recherche d'utilisateurs par nom
app.get('/searchUsers', async (req, res) => {
  try {
    const { query, userId } = req.query; // Texte recherché et ID de l'utilisateur connecté
    const usersCollection = database.collection('users');

    // Recherche avec une correspondance partielle (insensible à la casse)
    const users = await usersCollection.find({
      name: { $regex: query, $options: 'i' },  // Recherche insensible à la casse
      _id: { $ne: new ObjectId(userId) } // Exclure l'utilisateur connecté
    }).toArray();
    // Formate la réponse pour l'AutoComplete
    const formattedUsers = users.map(user => ({
      label: user.name,
      value: user.name,
      id: user._id.toString(),  // Conversion de l'ID en chaîne de caractères pour correspondre à l'ID dans l'interface frontend
    }));

    res.status(200).json(formattedUsers);
  } catch (error) {
    console.error('Erreur lors de la recherche des utilisateurs :', error);
    res.status(500).json({ message: 'Erreur lors de la recherche des utilisateurs' });
  }
});

// Route pour obtenir un utilisateur par email
app.get('/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const usersCollection = database.collection('users');
    const user = await usersCollection.findOne({ email });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur', error });
  }
});


async function checkConversationExists(user1_id, user2_id, conversationsCollection) {
  const conversation = await conversationsCollection.findOne({
    $or: [
      { user1_id, user2_id },
      { user1_id: user2_id, user2_id: user1_id }
    ]
  });
  return conversation;
}


app.get('/userName', async (req, res) => {
  try {
    const { userId } = req.query; // userId is expected to be a string (24-character hex string)
    const usersCollection = database.collection('users');
    
    // Ensure the userId is a valid ObjectId string
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid ObjectId format' });
    }

    // Convert userId to ObjectId
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (user) {
      res.status(200).json(user.name);
    } else {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur', error });
  }
});

app.get('/userConversation', async (req, res) => {
  try {
    const { userId } = req.query; // Utilisation de req.query pour récupérer les paramètres de la requête
    const usersCollection = database.collection('users');
    const conversationsCollection = database.collection('conversations');
    
    // Récupérer l'utilisateur par son ID
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (user) {
      // Récupérer les IDs des conversations de l'utilisateur
      const conversationIds = user.conversations;

      if (conversationIds.length === 0) {
        return res.status(200).json([]); // Retourner une liste vide si aucune conversation n'existe
      }

      // Rechercher les détails de chaque conversation dans la collection 'conversations'
      const conversations = await conversationsCollection.find({
        _id: { $in: conversationIds }
      }).toArray();


      res.status(200).json(conversations);
    } else {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur', error });
  }
});

app.post('/conversations/details', async (req, res) => {
  try {
    const { conversationIds } = req.body; // Attendez un tableau
    if (!Array.isArray(conversationIds)) {
      return res.status(400).json({ message: "conversationIds doit être un tableau." });
    }

    const conversationsCollection = database.collection('conversations');

    // Convertissez les IDs en ObjectId
    const parsedIds = conversationIds.map(id => new ObjectId(id));

    // Requête MongoDB avec `$in`
    const conversations = await conversationsCollection.find({ _id: { $in: parsedIds } }).toArray();

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Erreur lors de la récupération des conversations :", error);
    res.status(500).json({ message: 'Erreur lors de la récupération des conversations', error });
  }
});

