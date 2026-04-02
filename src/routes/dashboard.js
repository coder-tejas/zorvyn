const { PERMISSIONS } = require('../auth/permissions');

const dashboardRoute = {
  method: 'GET',
  path: '/dashboard',
  permission: PERMISSIONS.DASHBOARD_READ,
  description: 'Returns dashboard data for authorized users'
};

module.exports = {
  dashboardRoute
};
