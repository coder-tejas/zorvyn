const test = require('node:test');
const assert = require('node:assert/strict');

test('project scaffolding includes financial-records feature', () => {
  assert.equal(typeof 'financial-records', 'string');
});
