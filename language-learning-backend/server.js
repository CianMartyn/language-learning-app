const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');
require('dotenv').config()
const { GoogleGenerativeAI } = require("@google/generative-ai")
const { Server } = require('socket.io');
const port = 5000;

const app = express();
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:8100',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// MongoDB Client
const { MongoClient, ServerApiVersion } = require('mongodb'); 
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server 
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}
run();

// Mongoose Connection
mongoose
  .connect(process.env.MONGO_URI || uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB using Mongoose'))
  .catch((error) => console.error('Error connecting to MongoDB with Mongoose:', error));

// User Schema and Model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  sentFriendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  avatar: String,
  bio: String,
  country: String
});
const User = mongoose.model('User', userSchema);


// Login Endpoint
const jwt = require('jsonwebtoken'); // To generate JWT tokens
const bcrypt = require('bcrypt'); // To compare hashed passwords

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login request received:', { email, password }); // Debugging

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found'); // Debugging
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password'); // Debugging
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '365d' }
    );

    return res.status(200).json({ message: 'Login successful', token, username: user.username });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});


// Registration Endpoint


app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate inputs
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save new user with hashed password
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Auth middleware - Request path:', req.path);
  console.log('Auth middleware - Auth header:', authHeader);
  console.log('Auth middleware - Token:', token);

  if (!token) {
    console.log('Auth middleware - No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', async (err, decoded) => {
    if (err) {
      console.log('Auth middleware - Token verification failed:', err);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    try {
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      console.log('Auth middleware - Token verified, user:', user);
      req.user = {
        userId: decoded.userId,
        username: user.username
      };
      next();
    } catch (error) {
      console.error('Auth middleware - Error fetching user:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
}

// Delete account endpoint
app.delete('/delete-account', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Delete user from DB
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Error deleting account:', err);
    res.status(500).json({ message: 'Failed to delete account' });
  }
});

// Friend request route
app.post('/friend-request', authenticateToken, async (req, res) => {
  try {
    console.log('Friend request received:', req.body);
    const { toUsername } = req.body;
    const fromUser = await User.findById(req.user.userId);
    const toUser = await User.findOne({ username: toUsername });

    console.log('From user:', fromUser?.username);
    console.log('To user:', toUser?.username);

    if (!toUser) {
      console.log('User not found:', toUsername);
      return res.status(404).json({ message: 'User not found' });
    }

    if (!fromUser) {
      console.log('From user not found');
      return res.status(404).json({ message: 'Sender user not found' });
    }

    // Check if request already exists or if they're already friends
    const isRequestSent = toUser.friendRequests.includes(fromUser._id);
    const isAlreadyFriends = toUser.friends.includes(fromUser._id);

    console.log('Request status:', {
      isRequestSent,
      isAlreadyFriends,
      toUserFriendRequests: toUser.friendRequests,
      toUserFriends: toUser.friends
    });

    if (isRequestSent || isAlreadyFriends) {
      return res.status(400).json({ 
        message: isAlreadyFriends ? 'Already friends' : 'Friend request already sent'
      });
    }

    // Add the request to both users
    toUser.friendRequests.push(fromUser._id);
    fromUser.friendRequests.push(toUser._id);

    // Save both users
    await Promise.all([toUser.save(), fromUser.save()]);

    console.log('Friend request sent successfully:', {
      from: fromUser.username,
      to: toUser.username
    });

    res.status(200).json({ message: 'Friend request sent' });
  } catch (err) {
    console.error('Error sending friend request:', err);
    res.status(500).json({ message: 'Failed to send friend request', error: err.message });
  }
});

app.get('/friend-requests', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('friendRequests', 'username');
    const formattedRequests = user.friendRequests.map(request => ({
      _id: request._id,
      fromUsername: request.username
    }));
    res.status(200).json({ requests: formattedRequests });
  } catch (err) {
    console.error('Error getting friend requests:', err);
    res.status(500).json({ message: 'Failed to get friend requests' });
  }
});

app.post('/accept-request', authenticateToken, async (req, res) => {
  try {
    const { fromUserId } = req.body;

    const currentUser = await User.findById(req.user.userId);
    const fromUser = await User.findById(fromUserId);

    if (!currentUser.friendRequests.includes(fromUserId)) {
      return res.status(400).json({ message: 'No such friend request' });
    }

    // Add each other to friends list
    currentUser.friends.push(fromUserId);
    fromUser.friends.push(currentUser._id);

    // Remove the friend request from both users
    currentUser.friendRequests = currentUser.friendRequests.filter(
      id => id.toString() !== fromUserId
    );
    fromUser.friendRequests = fromUser.friendRequests.filter(
      id => id.toString() !== currentUser._id.toString()
    );

    await currentUser.save();
    await fromUser.save();

    res.status(200).json({ message: 'Friend request accepted' });
  } catch (err) {
    console.error('Error accepting friend request:', err);
    res.status(500).json({ message: 'Failed to accept friend request' });
  }
});

app.get('/friends', authenticateToken, async (req, res) => {
  try {
    console.log('GET /friends - Starting request processing');
    const user = await User.findById(req.user.userId)
      .populate({
        path: 'friends',
        select: 'username',
        model: 'User'
      });
    
    if (!user) {
      console.log('User not found, returning 404');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found, friends:', user.friends);
    const friends = user.friends.map(friend => ({
      _id: friend._id,
      username: friend.username
    }));

    console.log('Sending response with friends:', friends);
    res.status(200).json(friends);
  } catch (err) {
    console.error('Error in GET /friends:', err);
    res.status(500).json({ message: 'Failed to get friends', error: err.message });
  }
});

// Remove friend endpoint
app.delete('/friends/:friendId', authenticateToken, async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.userId;

    // Find both users
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: 'User or friend not found' });
    }

    // Remove friend from both users' friends lists
    user.friends = user.friends.filter(id => id.toString() !== friendId);
    friend.friends = friend.friends.filter(id => id.toString() !== userId);

    // Save both users
    await Promise.all([user.save(), friend.save()]);

    res.status(200).json({ message: 'Friend removed successfully' });
  } catch (err) {
    console.error('Error removing friend:', err);
    res.status(500).json({ message: 'Failed to remove friend', error: err.message });
  }
});

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/generate-lesson', async (req, res) => {
  try {
    const { language, topic } = req.body;

    if (!language || !topic) {
      return res.status(400).json({ error: 'Language and topic are required' });
    }

    const prompt = `
Create a detailed beginner-level language lesson on the topic "${topic}" in ${language}.
The lesson should follow this structure:
1. Title
2. Brief Introduction (why this topic is important)
3. Vocabulary List (words and their meanings)
4. Example Sentences (in ${language} with English translations)
5. Simple Dialogue (short conversation using the vocabulary)
6. Practice Activity (quiz, fill-in-the-blanks, or matching)
7. Conclusion or cultural tip

Use clear formatting. Output should be educational, friendly, and easy to follow.
`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    // Store the lesson content in memory for the tutor to reference
    if (!global.lessonContent) {
      global.lessonContent = new Map();
    }
    global.lessonContent.set(`${language}-${topic}`, response);

    res.json({ lesson: response });
  } catch (error) {
    console.error('Error generating lesson:', error);
    res.status(500).json({ error: 'Failed to generate lesson' });
  }
});

app.post('/lesson-tutor', authenticateToken, async (req, res) => {
  try {
    const { language, topic, message, unitLessons, scenarioPrompt } = req.body;

    if (!language || !topic || !message || !unitLessons) {
      return res.status(400).json({ error: 'Language, topic, message, and unit lessons are required' });
    }

    // Combine all lesson content with titles
    const combinedContent = unitLessons.map(lesson => 
      `Lesson: ${lesson.title}\n${lesson.content}`
    ).join('\n\n');

    const systemPrompt = `You are a helpful and encouraging ${language} language tutor. You have access to the following lessons:\n\n${combinedContent}\n\nYour role is to:\n1. Help the student practice vocabulary and concepts from all available lessons\n2. Correct any mistakes while referencing relevant lesson content\n3. Encourage usage of vocabulary and phrases from any lesson\n4. Provide examples that combine concepts from multiple lessons\n5. Keep the conversation focused on the unit's topic\n6. Use both ${language} and English in your responses\n7. If the student seems to understand the material well, introduce slightly more advanced related concepts`;

    const userPrompt = scenarioPrompt ? 
      `Student's message: "${message}"` :
      `Student's message: "${message}"`;

    console.log('Generating tutor response for unit:', topic);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: "I understand my role as a language tutor. I'll help the student practice while following the guidelines provided." }],
        }
      ]
    });
    const result = await chat.sendMessage(userPrompt);
    const response = await result.response.text();
    console.log('Tutor response generated');

    res.json({ response });
  } catch (error) {
    console.error('Error in lesson tutor:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Failed to get tutor response', 
      details: error.message 
    });
  }
});

// Message Schema
const messageSchema = new mongoose.Schema({
  room: String,
  username: String,
  message: String,
  time: String,
});
const Message = mongoose.model('Message', messageSchema);

// Handle Socket.IO connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Store the username when a user joins
  socket.on('joinRoom', ({ room, username }) => {
    if (!username) {
      console.error('No username provided for socket:', socket.id);
      return;
    }

    socket.join(room);
    socket.username = username; // Store username on socket
    socket.room = room; // Store current room
    console.log(`User ${username} joined room ${room}`);
    
    // Get all users in the room
    const roomUsers = Array.from(io.sockets.adapter.rooms.get(room) || []);
    const usernames = roomUsers.map(socketId => {
      const socket = io.sockets.sockets.get(socketId);
      return socket?.username || 'Anonymous';
    });

    // Broadcast to everyone in the room that a new user joined
    socket.to(room).emit('userJoined', { username, room });
    
    // Send the list of current users to the new user
    socket.emit('roomUsers', { room, users: usernames });
  });

  socket.on('leaveRoom', ({ room, username }) => {
    if (!username) {
      console.error('No username provided for socket:', socket.id);
      return;
    }

    socket.leave(room);
    console.log(`User ${username} left room ${room}`);
    
    // Broadcast to everyone in the room that a user left
    socket.to(room).emit('userLeft', { username, room });
  });

  socket.on('chatMessage', async ({ room, username, message }) => {
    if (!username) {
      console.error('No username provided for message from socket:', socket.id);
      return;
    }

    const time = new Date().toLocaleTimeString();
    const msg = new Message({ room, username, message, time });
    await msg.save();
    io.to(room).emit('message', { 
      _id: msg._id,
      username, 
      message, 
      time 
    });
    console.log("Sending message:", { _id: msg._id, username, message, time });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
    // If the socket was in a room, notify others
    if (socket.room && socket.username) {
      socket.to(socket.room).emit('userLeft', { 
        username: socket.username, 
        room: socket.room 
      });
    }
  });
});

// Get messages for a room
app.get('/messages/:room', authenticateToken, async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.room })
      .sort({ time: 1 })
      .exec();
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Delete a message
app.delete('/messages/:messageId', authenticateToken, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only allow users to delete their own messages
    if (message.username !== req.user.username) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    await Message.findByIdAndDelete(req.params.messageId);
    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Get user profile by username
app.get('/users/:username', authenticateToken, async (req, res) => {
  try {
    console.log('Looking for user:', req.params.username);
    const user = await User.findOne({ username: req.params.username });
    console.log('Found user:', user);
    
    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      _id: user._id,
      username: user.username,
      avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.username)}`,
      bio: user.bio || '',
      country: user.country || ''
    });
  } catch (err) {
    console.error('Error getting user profile:', err);
    res.status(500).json({ message: 'Failed to get user profile', error: err.message });
  }
});

// Check if a user is a friend
app.get('/friends/is-friend/:username', authenticateToken, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId);
    const targetUser = await User.findOne({ username: req.params.username });

    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFriend = currentUser.friends.includes(targetUser._id);
    res.status(200).json(isFriend);
  } catch (err) {
    console.error('Error checking friendship:', err);
    res.status(500).json({ message: 'Failed to check friendship', error: err.message });
  }
});

// Update user profile
app.put('/users/:username', authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;
    const { bio, country } = req.body;

    // Get the user from the request (set by authenticateToken middleware)
    const currentUser = req.user;
    if (!currentUser || currentUser.username !== username) {
      return res.status(403).json({ message: 'You can only update your own profile' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's profile
    user.bio = bio || user.bio;
    user.country = country || user.country;
    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        username: user.username,
        bio: user.bio,
        country: user.country,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
});

// Vocabulary generation endpoint
app.post('/api/vocabulary/generate', authenticateToken, async (req, res) => {
  try {
    const { language } = req.body;
    
    const requestBody = {
      contents: [{
        parts: [{
          text: `Generate 30 vocabulary words in ${language} with their English translations and example sentences. 
          Format the response as a valid JSON array of objects with the following structure:
          [
            {
              "word": "word in target language",
              "translation": "English translation",
              "example": "Example sentence in target language",
              "category": "Category of the word"
            }
          ]
          
          Make sure to:
          1. Include a variety of categories (verbs, nouns, adjectives, etc.)
          2. Use different difficulty levels
          3. Include common and useful words
          4. Make sure the response is a valid JSON array and nothing else.`
        }]
      }],
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(requestBody);
    
    if (result && result.response && result.response.candidates && result.response.candidates[0]?.content?.parts[0]?.text) {
      try {
        const generatedCards = result.response.candidates[0].content.parts[0].text;
        const parsedCards = JSON.parse(generatedCards);
        
        if (Array.isArray(parsedCards)) {
          res.json(parsedCards);
        } else {
          throw new Error('Invalid response format: not an array');
        }
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        res.status(500).json({ error: 'Failed to parse vocabulary data' });
      }
    } else {
      res.status(500).json({ error: 'Invalid response from Gemini API' });
    }
  } catch (error) {
    console.error('Error generating vocabulary:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to generate vocabulary'
    });
  }
});

// Practice Scenario Endpoint
app.post('/chat/practice-scenario', authenticateToken, async (req, res) => {
  try {
    const { message, language, character, role, context, history } = req.body;

    if (!message || !language || !character || !role || !context) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const systemPrompt = `You are ${character}, a ${role}. ${context}
    Your role is to:
    1. Help the student practice ${language} in a realistic scenario
    2. Stay in character as ${character}
    3. Use both ${language} and English in your responses
    4. Correct any mistakes while being encouraging
    5. Keep the conversation focused on the scenario context
    6. If the student seems to understand well, introduce slightly more advanced concepts`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: `I understand my role as ${character}. I'll help the student practice while staying in character.` }],
        },
        ...history.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        }))
      ]
    });

    const result = await chat.sendMessage(message);
    const response = await result.response.text();

    res.json({ message: response });
  } catch (error) {
    console.error('Error in practice scenario:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

//Start server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
