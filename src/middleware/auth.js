const { getPermissionsForRoles } = require('../auth/permissions');
const { userStatus } = require('../services/store');

function authenticate(store, userId) {
  if (!userId) {
    return { ok: false, code: 401, body: { message: 'Missing x-user-id header' } };
  }

  const user = store.getUserById(userId);
  if (!user) {
    return { ok: false, code: 401, body: { message: 'Unknown user' } };
  }

  if (user.status !== userStatus.ACTIVE) {
    return { ok: false, code: 403, body: { message: 'User is inactive' } };
  }

  return {
    ok: true,
    user: {
      ...user,
      permissions: getPermissionsForRoles(user.roles)
    }
  };
}

function authorize(user, permission) {
  if (!user.permissions.has(permission)) {
    return { ok: false, code: 403, body: { message: `Missing required permission: ${permission}` } };
  }

  return { ok: true };
}

module.exports = {
  authenticate,
  authorize
};
