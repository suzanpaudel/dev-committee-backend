const express = require('express');
require('dotenv').config();
const connectDB = require('./config/connectDB');

const app = express();

connectDB();

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send(`API is running`);
});

app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});
