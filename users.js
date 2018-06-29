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

module.exports = {
  tenant1,
  tenant2,
  landlord,
};
