const {
  STRIPE_API_KEY,
  SERVER_PORT,
  SERVER_HOST,
} = process.env;

const CURRENCY = 'gbp';

const bodyParser = require('body-parser');
const express = require('express');
const stripe = require('stripe')(STRIPE_API_KEY);

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.listen(SERVER_PORT, SERVER_HOST);

app.post('/api/payement', (req, res) => {
  const { body: { token } } = req;

  // Create a Charge:
  stripe.charges.create({
    amount: 10000,
    currency: CURRENCY,
    source: 'tok_visa',
    transfer_group: "{ORDER10}",
  }).then(function(charge) {
    console.log(charge)
    // asynchronously called
  });

  // // Create a Transfer to the connected account (later):
  // stripe.transfers.create({
  //   amount: 7000,
  //   currency: CURRENCY,
  //   destination: "{CONNECTED_STRIPE_ACCOUNT_ID}",
  //   transfer_group: "{ORDER10}",
  // }).then(function(transfer) {
  //   // asynchronously called
  // });
  //
  // // Create a second Transfer to another connected account (later):
  // stripe.transfers.create({
  //   amount: 2000,
  //   currency: CURRENCY,
  //   destination: "{OTHER_CONNECTED_STRIPE_ACCOUNT_ID}",
  //   transfer_group: "{ORDER10}",
  // }).then(function(second_transfer) {
  //   // asynchronously called
  // });

  res.status(200).jsonp(token);
});

