const { randomUUID } = require('node:crypto');
const { ROLES } = require('../auth/permissions');

const userStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};

class Store {
  constructor() {
    this.users = new Map();
    this.records = new Map();

    const adminId = randomUUID();
    this.users.set(adminId, {
      id: adminId,
      email: 'admin@zorvyn.local',
      status: userStatus.ACTIVE,
      roles: [ROLES.ADMIN],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  createUser({ email, roles = [ROLES.VIEWER], status = userStatus.ACTIVE }) {
    const id = randomUUID();
    const now = new Date().toISOString();
    const user = { id, email, status, roles, createdAt: now, updatedAt: now };
    this.users.set(id, user);
    return user;
  }

  getUsers() { return Array.from(this.users.values()); }
  getUserById(id) { return this.users.get(id); }

  updateUserStatus(id, status) {
    const user = this.users.get(id);
    if (!user) return null;
    const updated = { ...user, status, updatedAt: new Date().toISOString() };
    this.users.set(id, updated);
    return updated;
  }

  assignRoles(id, roles) {
    const user = this.users.get(id);
    if (!user) return null;
    const updated = { ...user, roles: [...new Set(roles)], updatedAt: new Date().toISOString() };
    this.users.set(id, updated);
    return updated;
  }

  createRecord({ title, ownerId }) {
    const id = randomUUID();
    const now = new Date().toISOString();
    const record = { id, title, ownerId, createdAt: now, updatedAt: now };
    this.records.set(id, record);
    return record;
  }

  updateRecord(id, patch) {
    const record = this.records.get(id);
    if (!record) return null;
    const updated = { ...record, ...patch, updatedAt: new Date().toISOString() };
    this.records.set(id, updated);
    return updated;
  }

  listRecords() { return Array.from(this.records.values()); }
}

module.exports = { Store, userStatus };
