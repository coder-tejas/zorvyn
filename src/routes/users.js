const { PERMISSIONS } = require('../auth/permissions');

const usersRoutes = [
  {
    method: 'GET',
    path: '/users',
    permission: PERMISSIONS.USERS_MANAGE,
    description: 'List users'
  },
  {
    method: 'POST',
    path: '/users',
    permission: PERMISSIONS.USERS_MANAGE,
    description: 'Create users'
  },
  {
    method: 'PATCH',
    path: '/users/:id/status',
    permission: PERMISSIONS.USERS_MANAGE,
    description: 'Activate or deactivate users'
  },
  {
    method: 'PATCH',
    path: '/users/:id/roles',
    permission: PERMISSIONS.ROLES_ASSIGN,
    description: 'Assign roles to a user'
  }
];

module.exports = {
  usersRoutes
};
