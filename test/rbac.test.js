const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../src/app');
const { ROLES } = require('../src/auth/permissions');

function invoke(app, method, path, userId, body) {
  const response = app.handleRequest({
    method,
    path,
    headers: userId ? { 'x-user-id': userId } : {},
    rawBody: body ? JSON.stringify(body) : ''
  });

  return {
    status: response.code,
    body: JSON.parse(response.body)
  };
}

function createSeededApp() {
  const app = createApp();
  const users = app.store.getUsers();
  const admin = users.find((user) => user.roles.includes(ROLES.ADMIN));
  const analyst = app.store.createUser({ email: 'analyst@test.local', roles: [ROLES.ANALYST] });
  const viewer = app.store.createUser({ email: 'viewer@test.local', roles: [ROLES.VIEWER] });
  return { app, admin, analyst, viewer };
}

test('viewer can read dashboard but cannot read records', () => {
  const { app, viewer } = createSeededApp();

  const dashboard = invoke(app, 'GET', '/dashboard', viewer.id);
  assert.equal(dashboard.status, 200);

  const records = invoke(app, 'GET', '/records', viewer.id);
  assert.equal(records.status, 403);
});

test('analyst can read records but cannot create records', () => {
  const { app, analyst } = createSeededApp();

  const read = invoke(app, 'GET', '/records', analyst.id);
  assert.equal(read.status, 200);

  const create = invoke(app, 'POST', '/records', analyst.id, { title: 'Quarterly Report' });
  assert.equal(create.status, 403);
});

test('admin can manage users and create records', () => {
  const { app, admin, analyst } = createSeededApp();

  const record = invoke(app, 'POST', '/records', admin.id, { title: 'Revenue Ledger' });
  assert.equal(record.status, 201);

  const statusChange = invoke(app, 'PATCH', `/users/${analyst.id}/status`, admin.id, { status: 'inactive' });
  assert.equal(statusChange.status, 200);
  assert.equal(statusChange.body.user.status, 'inactive');
});

test('inactive user is blocked from all protected routes', () => {
  const { app } = createSeededApp();
  const inactive = app.store.createUser({
    email: 'inactive@test.local',
    roles: [ROLES.ANALYST],
    status: 'inactive'
  });

  const dashboard = invoke(app, 'GET', '/dashboard', inactive.id);
  assert.equal(dashboard.status, 403);
});
