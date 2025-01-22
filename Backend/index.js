const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());  // Parse incoming JSON request bodies

// CORS configuration to allow frontend (http://localhost:5173) to make requests
const corsOptions = {
  origin: 'http://localhost:5173',  // Frontend URL
  methods: 'GET,POST,PUT,DELETE',
  credentials: true,  // Allow cookies to be sent (you can remove this if not using cookies)
};
app.use(cors(corsOptions));

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/sampledb")
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB not connected", err));

// Define Schema
const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },  // Storing password in plain text (Not recommended for production)
});

const User = mongoose.model("User", userSchema);

// POST Route - SignUp (Create a new user)
app.post('/signup', async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).send("Please provide name and password.");
  }

  try {
    const newUser = new User({
      name,
      password,  // Storing plain text password (Not recommended)
    });

    await newUser.save();
    res.status(201).send("User created successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error occurred while signing up.");
  }
});

// POST Route - SignIn (Authenticate the user)
app.post('/signin', async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).send("Please provide name and password.");
  }

  try {
    // Find user by name
    const user = await User.findOne({ name });

    if (!user) {
      return res.status(400).send("User not found.");
    }

    // Compare plain text password with stored password
    if (password !== user.password) {
      return res.status(400).send("Wrong password.");
    }

    // If successful, create a JWT token
    const secret = "gulshan";  // This should be stored securely (e.g., in .env file)
    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '1h' });

    // Send the token directly in the response body
    res.status(200).json({ message: "Signin successful", token: token });

  } catch (error) {
    console.error(error);
    res.status(500).send("Error occurred while signing in.");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
