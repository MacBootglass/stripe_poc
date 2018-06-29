const {
  STRIPE_API_KEY,
  SERVER_PORT,
  SERVER_HOST,
} = process.env;

const CURRENCY = 'gbp';
const TRANSFER_GROUP = 'RENT';

const tenantAccountId = 'acct_1CiO7kB38juqwZ48';
const tenantCustomerId = 'cus_D8fSPD85qw32vN';
const landlordAccountId = 'acct_1CiPQZGsJM8irX6E';


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
    {email: user.email},
    {stripe_account: user.id}
  )))
  .then(displayResult('create customers'))
  .then(customers => Object.assign(store, { customers }));

const userPayment = ({ amount, customer }) => () =>
  stripe.charges
    .create({
      amount,
      currency: CURRENCY,
      customer,
      transfer_group: TRANSFER_GROUP,
    })
    .then(displayResult('payment'))
    .then(charges => Object.assign(store, {
      charges: [...(store.charges || []), charges],
    }));

const userTransfer = ({ amount, account }) => () =>
  stripe.transfers
    .create({
      amount,
      currency: CURRENCY,
      destination: account,
      transfer_group: TRANSFER_GROUP,
    })
    .then(displayResult('landlord transfer'))
    .then(charges => Object.assign(store, {
      transfers: [...(store.transfers || []), transfers],
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
  // const { customers: [customer] } = store;
  // const { users: [user] } = store;

  const email = 'tenant@rentoo.co.uk';
  // Promise.all([
  //   stripe.accounts.create({
  //     type: 'custom',
  //     country: 'GB',
  //     email,
  //   }),
  //   stripe.customers.create({
  //     email,
  //     description: 'A new tenant',
  //     source: token.id,
  //   })])
  //   .then(([account, customer]) => stripe.tokens.create(
  //     { customer: customer.id },
  //     { stripe_account: account.id }
  //   ))

  stripe.customers
    .create({
      email,
      description: 'A new tenant',
      source: token.id,
    })
    .then(displayResult('customer'))


  // stripe.customers.create({
  //   description: 'Customer for sophia.jones@example.com',
  //   source: token.id,
  // })

  // stripe.accounts.createExternalAccount(
  //   'acct_1Chy7wAbkXS1rGRX',
  //   { external_account: 'tok_visa_debit' },
  // }

  // stripe.accounts.createExternalAccount(
  //   user.id,
  //   { external_account: token.id }
  // )

  // stripe.customers.createSource(customer.id, {
  //   source: token.id,
  // })

  .then(customer => userPayment({ customer: customer.id, amount: 100000 })())
  .then(userTransfer({ account: landlordAccountId, amount: 5000 }))
  .then(result => res.status(200).jsonp(result))
  .catch((err) => {
    console.log(err)
    res.sendStatus(500);
  });

  // res.status(200).jsonp(token)
};

const payment = (req, res) => {
  stripe.tokens
    .create(
      { customer: tenantCustomerId },
      { stripe_account: tenantAccountId }
    )
    .then(tok => userPayment({ token: tok.id, amount: 100000 })())
    .then(userTransfer({ account: landlordAccountId, amount: 5000 }))
    .then(result => res.status(200).jsonp(result))
    .catch((err) => {
      console.log(err)
      res.sendStatus(500);
    });
};


app.post('/api/payment', payment);
app.post('/api/create-card', createCard);

// clean(100)
  // .then(createAccounts)
  // .then(createCustomers)
  // .then(tenantPayment({ amount: 1000, token: 'tok_mastercard_debit_transferSuccess' }))
  // .then(tenantPayment({ amount: 2000, token: 'tok_mastercard_debit_transferSuccess' }))
  // .then(landlordTransfer({ amount: 2000 }))
