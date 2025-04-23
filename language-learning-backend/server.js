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
  sentFriendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
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
      { expiresIn: '1h' }
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

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
    if (err) {
      console.log('Auth middleware - Token verification failed:', err);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    console.log('Auth middleware - Token verified, user:', user);
    req.user = user;
    next();
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
    res.status(200).json({ requests: user.friendRequests });
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

    // Remove the friend request
    currentUser.friendRequests = currentUser.friendRequests.filter(
      id => id.toString() !== fromUserId
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


const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    res.json({ lesson: response });
  } catch (error) {
    console.error('Error generating lesson:', error);
    res.status(500).json({ error: 'Failed to generate lesson' });
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

  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  socket.on('leaveRoom', (room) => {
    socket.leave(room);
    console.log(`User ${socket.id} left room ${room}`);
  });

  socket.on('chatMessage', async ({ room, username, message }) => {
    const time = new Date().toLocaleTimeString();
    const msg = new Message({ room, username, message, time });
    await msg.save();
    io.to(room).emit('message', { username, message, time });
    console.log("Sending message:", { username, message, time });
  });


  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

//Start server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
