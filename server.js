const express = require('express');
require('dotenv').config();
const connectDB = require('./config/connectDB');

//import routes
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const postRoutes = require('./routes/posts');

const app = express();

//connected to database
connectDB();

app.get('/', (req, res) => {
  res.send(`API is running`);
});

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/posts', postRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});
