import assert from 'node:assert/strict';
import { test } from 'node:test';
import { classifyMongoError } from './database.js';

test('MongoDB errors are classified without returning raw connection details', () => {
    assert.equal(classifyMongoError({ code: 18, message: 'Authentication failed' }), 'MONGODB_AUTH_FAILED');
    assert.equal(classifyMongoError({ name: 'MongooseServerSelectionError', message: 'server selection timed out' }), 'MONGODB_TIMEOUT');
    assert.equal(classifyMongoError({ message: 'querySrv ENOTFOUND cluster.example' }), 'MONGODB_NETWORK_FAILED');
    assert.equal(classifyMongoError(new Error('unexpected')), 'MONGODB_CONNECTION_FAILED');
});
