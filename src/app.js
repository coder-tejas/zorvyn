const { Store, userStatus } = require('./services/store');
const { PERMISSIONS, ROLE_PERMISSIONS } = require('./auth/permissions');
const { authenticate, authorize } = require('./middleware/auth');

function json(code, body) {
  return {
    code,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  };
}

function parseBody(raw) {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function createApp() {
  const store = new Store();

  function handleRequest({ method, path, headers = {}, rawBody = '' }) {
    if (method === 'GET' && path === '/health') return json(200, { status: 'ok' });

    const auth = authenticate(store, headers['x-user-id']);
    if (!auth.ok) return json(auth.code, auth.body);

    const user = auth.user;
    const body = parseBody(rawBody);

    if (rawBody && body === null) return json(400, { message: 'Body must be valid JSON' });

    if (method === 'GET' && path === '/dashboard') {
      const allowed = authorize(user, PERMISSIONS.DASHBOARD_READ);
      if (!allowed.ok) return json(allowed.code, allowed.body);
      return json(200, { message: 'Dashboard metrics visible', userId: user.id, roles: user.roles });
    }

    if (method === 'GET' && path === '/records') {
      const allowed = authorize(user, PERMISSIONS.RECORDS_READ);
      if (!allowed.ok) return json(allowed.code, allowed.body);
      return json(200, { records: store.listRecords() });
    }

    if (method === 'POST' && path === '/records') {
      const allowed = authorize(user, PERMISSIONS.RECORDS_WRITE);
      if (!allowed.ok) return json(allowed.code, allowed.body);
      if (!body.title) return json(400, { message: 'title is required' });
      return json(201, { record: store.createRecord({ title: body.title, ownerId: user.id }) });
    }

    const patchRecordMatch = path.match(/^\/records\/([^/]+)$/);
    if (method === 'PATCH' && patchRecordMatch) {
      const allowed = authorize(user, PERMISSIONS.RECORDS_WRITE);
      if (!allowed.ok) return json(allowed.code, allowed.body);
      if (!body.title) return json(400, { message: 'title is required' });
      const updated = store.updateRecord(patchRecordMatch[1], { title: body.title });
      if (!updated) return json(404, { message: 'Record not found' });
      return json(200, { record: updated });
    }

    if (method === 'GET' && path === '/users') {
      const allowed = authorize(user, PERMISSIONS.USERS_MANAGE);
      if (!allowed.ok) return json(allowed.code, allowed.body);
      return json(200, { users: store.getUsers() });
    }

    if (method === 'POST' && path === '/users') {
      const allowed = authorize(user, PERMISSIONS.USERS_MANAGE);
      if (!allowed.ok) return json(allowed.code, allowed.body);
      if (!body.email) return json(400, { message: 'email is required' });
      if (body.roles && body.roles.some((role) => !ROLE_PERMISSIONS[role])) {
        return json(400, { message: 'Invalid role in roles array' });
      }
      if (body.status && !Object.values(userStatus).includes(body.status)) {
        return json(400, { message: 'Invalid status' });
      }
      return json(201, { user: store.createUser({ email: body.email, roles: body.roles, status: body.status }) });
    }

    const statusMatch = path.match(/^\/users\/([^/]+)\/status$/);
    if (method === 'PATCH' && statusMatch) {
      const allowed = authorize(user, PERMISSIONS.USERS_MANAGE);
      if (!allowed.ok) return json(allowed.code, allowed.body);
      if (!Object.values(userStatus).includes(body.status)) return json(400, { message: 'Invalid status' });
      const updated = store.updateUserStatus(statusMatch[1], body.status);
      if (!updated) return json(404, { message: 'User not found' });
      return json(200, { user: updated });
    }

    const rolesMatch = path.match(/^\/users\/([^/]+)\/roles$/);
    if (method === 'PATCH' && rolesMatch) {
      const allowed = authorize(user, PERMISSIONS.ROLES_ASSIGN);
      if (!allowed.ok) return json(allowed.code, allowed.body);
      if (!Array.isArray(body.roles) || body.roles.length === 0) {
        return json(400, { message: 'roles must be a non-empty array' });
      }
      if (body.roles.some((role) => !ROLE_PERMISSIONS[role])) {
        return json(400, { message: 'Invalid role in roles array' });
      }
      const updated = store.assignRoles(rolesMatch[1], body.roles);
      if (!updated) return json(404, { message: 'User not found' });
      return json(200, { user: updated });
    }

    return json(404, { message: 'Not found' });
  }

  return { store, handleRequest };
}

module.exports = { createApp };
