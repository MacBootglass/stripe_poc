const {
  STRIPE_API_KEY,
  SERVER_PORT,
  SERVER_HOST,
} = process.env;

const express = require('express');
const stripe = require('stripe')(STRIPE_API_KEY);

const app = express();

app.listen(SERVER_PORT, SERVER_HOST);

app.use(express.static('public'));

const payement = (req, res) => {
  res.send('hello world');
};

app.get('/api/payement', payement);

