const {
  STRIPE_API_KEY,
  SERVER_PORT,
  SERVER_HOST,
} = process.env;

const CURRENCY = 'gbp';
const TRANSFER_GROUP = 'RENT';

const bodyParser = require('body-parser');
const express = require('express');
const stripe = require('stripe')(STRIPE_API_KEY);

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.listen(SERVER_PORT, SERVER_HOST);

const store = {};
const { tenant1, tenant2, landlord } = require('./users');

const displayResult = step => (res) => {
  console.log('----------------------');
  console.log(step);
  console.log('----------------------');
  console.log(res);
  console.log('\n\n\n\n');
  return res;
};

const createAccounts = () => Promise.all([
  stripe.accounts.create(tenant1),
  stripe.accounts.create(tenant2),
  stripe.accounts.create(landlord),
])
// .then(displayResult('user creation'))
.then(users => Object.assign(store, { users }));

const createCustomers = ({ users }) =>
  Promise.all(users.map(user => stripe.customers.create(
    {
      email: user.email,
      description: user.email,
    }
  )))
  .then(displayResult('create customers'))
  .then(customers => Object.assign(store, { customers }));

const tenantPayment = ({ amount, token }) => () =>
  stripe.charges
    .create({
      amount,
      currency: CURRENCY,
      source: token,
      transfer_group: TRANSFER_GROUP,
    })
    .then(displayResult('tenant payment'))
    .then(charges => Object.assign(store, {
      charges: [...store.charges, charges],
    }));

const landlordTransfer = ({ amount }) => () =>
  stripe.transfers
    .create({
      amount,
      currency: CURRENCY,
      destination: store.users[2].id,
      transfer_group: TRANSFER_GROUP,
    })
    .then(displayResult('landlord transfer'))
    .then(charges => Object.assign(store, {
      transfers: [...store.transfers, transfers],
    }));

const getCustomer = (...customers) =>
  stripe.customers
    .retrieve(...customers)
    .then(displayResult('get customer'));

const listCustomers = limit =>
  stripe.customers
    .list({ limit })
    .then(res => res.data)
    // .then(displayResult('list customers'));

const listAccounts = limit =>
  stripe.accounts
    .list({ limit })
    .then(res => res.data)
    // .then(displayResult('list accounts'));


const clean = (limit) =>
  Promise.all([
    listCustomers(limit),
    listAccounts(limit),
  ])
  .then(([customers, accounts]) => {
    const deleteCustomers = customers.map(cursor => stripe.customers.del(cursor.id));
    const deleteAccounts = accounts.map(cursor => stripe.accounts.del(cursor.id));
    return Promise.all([
      ...deleteCustomers,
      ...deleteAccounts
    ]);
  });



/* --------------------- */
/* MIDDLEWARE            */
/* --------------------- */

const createCard = (req, res) => {
  const { body: { token } } = req;
  const { customers: [user] } = store;

  console.log(user.id)

  stripe.customers.create({
    description: 'Customer for sophia.jones@example.com',
    source: token.id,
  // stripe.customers.createSource('cus_D8bnegadfGbQQu', {
  //   source: token.id,
  })
  .then(displayResult('create card'))
  .then(result => res.status(200).jsonp(result))
  .catch((err) => {
    console.log(err)
    res.sendStatus(500);
  });
};

const payment = (req, res) => {
  const { body: { token } } = req;
  res.status(200).jsonp(token);
};


app.post('/api/payement', payment);
app.post('/api/create-card', createCard);

// getCustomer('cus_D8bnegadfGbQQu')
clean(100)
  .then(createAccounts)
  .then(createCustomers)
  .then(() => listCustomers(100));
  // .then(tenantPayment({ amount: 1000, token: 'tok_mastercard_debit_transferSuccess' }))
  // .then(tenantPayment({ amount: 2000, token: 'tok_mastercard_debit_transferSuccess' }))
  // .then(landlordTransfer({ amount: 2000 }))
