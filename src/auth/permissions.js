const ROLES = {
  VIEWER: 'viewer',
  ANALYST: 'analyst',
  ADMIN: 'admin'
};

const PERMISSIONS = {
  DASHBOARD_READ: 'dashboard:read',
  RECORDS_READ: 'records:read',
  INSIGHTS_READ: 'insights:read',
  RECORDS_WRITE: 'records:write',
  USERS_MANAGE: 'users:manage',
  ROLES_ASSIGN: 'roles:assign'
};

const ROLE_PERMISSIONS = {
  [ROLES.VIEWER]: new Set([PERMISSIONS.DASHBOARD_READ]),
  [ROLES.ANALYST]: new Set([
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.RECORDS_READ,
    PERMISSIONS.INSIGHTS_READ
  ]),
  [ROLES.ADMIN]: new Set([
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.RECORDS_READ,
    PERMISSIONS.INSIGHTS_READ,
    PERMISSIONS.RECORDS_WRITE,
    PERMISSIONS.USERS_MANAGE,
    PERMISSIONS.ROLES_ASSIGN
  ])
};

function getPermissionsForRoles(roles = []) {
  return [...roles].reduce((aggregate, role) => {
    const rolePermissions = ROLE_PERMISSIONS[role] || new Set();
    for (const permission of rolePermissions) aggregate.add(permission);
    return aggregate;
  }, new Set());
}

module.exports = {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  getPermissionsForRoles
};
