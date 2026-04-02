const { PERMISSIONS } = require('../auth/permissions');

const recordsRoutes = [
  {
    method: 'GET',
    path: '/records',
    permission: PERMISSIONS.RECORDS_READ,
    description: 'List records'
  },
  {
    method: 'POST',
    path: '/records',
    permission: PERMISSIONS.RECORDS_WRITE,
    description: 'Create a record'
  },
  {
    method: 'PATCH',
    path: '/records/:id',
    permission: PERMISSIONS.RECORDS_WRITE,
    description: 'Update a record'
  }
];

module.exports = {
  recordsRoutes
};
