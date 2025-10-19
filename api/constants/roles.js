export const ROLES = {
  ADMIN: 'ADMIN',
  OWNER: 'OWNER',
  TENANT: 'TENANT',
  GUEST: 'GUEST'
};

export const ROLE_PERMISSIONS = {
  ADMIN: ['*'],
  OWNER: [
    'CREATE_PROPERTY',
    'UPDATE_PROPERTY',
    'DELETE_PROPERTY',
    'CREATE_AGREEMENT',
    'UPDATE_AGREEMENT',
    'VIEW_PAYMENTS'
  ],
  TENANT: [
    'VIEW_PROPERTY',
    'MAKE_PAYMENT',
    'VIEW_PAYMENTS'
  ],
  GUEST: [
    'VIEW_PROPERTY'
  ]
};