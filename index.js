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



const tenant1 = {
  type: 'custom',
  country: 'GB',
  email: 'tenant1@rentoo.co.uk',
  legal_entity: {
    address: {
      city: 'London',
      country: 'GB',
      line1: '4 sulgrave gardens',
      postal_code: 'W67RA',
    },
    dob: {
      day: 4,
      month: 12,
      year: 1995,
    },
    first_name: 'Tenant One',
    last_name: 'Rentoo',
  },
  type: 'custom',
};

const tenant2 = {
  type: 'custom',
  country: 'GB',
  email: 'tenant2@rentoo.co.uk',
  legal_entity: {
    address: {
      city: 'London',
      country: 'GB',
      line1: '5 sulgrave gardens',
      postal_code: 'W67RA',
    },
    dob: {
      day: 5,
      month: 12,
      year: 1995,
    },
    first_name: 'Tenant Two',
    last_name: 'Rentoo',
  },
  type: 'custom',
};

const landlord = {
  type: 'custom',
  country: 'GB',
  email: 'landlord@rentoo.co.uk',
  legal_entity: {
    address: {
      city: 'London',
      country: 'GB',
      line1: '6 sulgrave gardens',
      postal_code: 'W67RA',
    },
    dob: {
      day: 6,
      month: 12,
      year: 1995,
    },
    first_name: 'Landlord',
    last_name: 'Rentoo',
  },
  type: 'custom',
};


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
.then(displayResult('user creation'));

const tenantPayment = ({ amount, token }) => users =>
  stripe.charges
    .create({
      amount,
      currency: CURRENCY,
      source: token,
      transfer_group: TRANSFER_GROUP,
    })
    .then(displayResult('tenant payment'))
    .then(() => users);

const landlordTransfer = ({ amount }) => users =>
  stripe.transfers
    .create({
      amount,
      currency: CURRENCY,
      destination: users[2].id,
      transfer_group: TRANSFER_GROUP,
    })
    .then(displayResult('landlord transfer'))
    .then(() => users);


const createCustomers = users =>
  Promise.all(users.map(user => stripe.customers.create(
    {email: user.email},
    {stripe_account: user.id}
  )))
  .then(displayResult('create customers'))
  .then(() => users);

createAccounts()
  .then(createCustomers)
  .then(tenantPayment({ amount: 1000, token: 'tok_mastercard_debit_transferSuccess' }))
  .then(tenantPayment({ amount: 2000, token: 'tok_mastercard_debit_transferSuccess' }))
  .then(landlordTransfer({ amount: 2000 }))


const createBankAccount = (req, res) => {
  stripe.accounts.createExternalAccount(
  "acct_1Chy7wAbkXS1rGRX",
  { external_account: "btok_1CiIS1AbkXS1rGRX31EBUMd4" },
  function(err, bank_account) {
    // asynchronously called
  }
);
};

app.post('/api/payement', (req, res) => {
  const { body: { token } } = req;
  res.status(200).jsonp(token);
});
