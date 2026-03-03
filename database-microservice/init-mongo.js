/**
 * MongoDB Initialization Script
 * 
 * Purpose: Initialize the testops database with users collection
 * This script runs automatically when MongoDB container starts for the first time
 */

// Switch to testops database (creates it if doesn't exist)
db = db.getSiblingDB('testops');

print('=== Starting MongoDB Initialization ===');

// ==================================================
// USERS COLLECTION SETUP
// ==================================================

// Create users collection
print('Creating users collection...');
db.createCollection('users');

// Create indexes for users collection
// Index on username field - must be unique
print('Creating unique index on username...');
db.users.createIndex(
  { "username": 1 }, 
  { unique: true }
);

// Index on email field - must be unique
print('Creating unique index on email...');
db.users.createIndex(
  { "email": 1 }, 
  { unique: true }
);

// Index on role for filtering users by role
print('Creating index on role...');
db.users.createIndex(
  { "role": 1 }
);

// Index on created_at for sorting
print('Creating index on created_at...');
db.users.createIndex(
  { "created_at": -1 }
);

// ==================================================
// SCREENSHOTS COLLECTION SETUP
// ==================================================

print('Creating screenshots collection...');
db.createCollection('screenshots');

// Index on email for filtering by user
print('Creating index on email for screenshots...');
db.screenshots.createIndex({ "email": 1 });

// Index on id (test execution id) for grouping screenshots
print('Creating index on id for screenshots...');
db.screenshots.createIndex({ "id": 1 });

// Index on datetime for sorting
print('Creating index on datetime for screenshots...');
db.screenshots.createIndex({ "datetime": -1 });

// Compound index for efficient queries by email and test id
print('Creating compound index on email+id for screenshots...');
db.screenshots.createIndex({ "email": 1, "id": 1 });

// ==================================================
// LOGS COLLECTION SETUP
// ==================================================

print('Creating logs collection...');
db.createCollection('logs');

// Index on email for filtering by user
print('Creating index on email for logs...');
db.logs.createIndex({ "email": 1 });

// Index on id (test execution id) for grouping logs
print('Creating index on id for logs...');
db.logs.createIndex({ "id": 1 });

// Index on datetime for sorting
print('Creating index on datetime for logs...');
db.logs.createIndex({ "datetime": -1 });

// Compound index for efficient queries by email and test id
print('Creating compound index on email+id for logs...');
db.logs.createIndex({ "email": 1, "id": 1 });

// ==================================================
// VIDEOS COLLECTION SETUP
// ==================================================

print('Creating videos collection...');
db.createCollection('videos');

// Index on email for filtering by user
print('Creating index on email for videos...');
db.videos.createIndex({ "email": 1 });

// Index on id (test execution id) for grouping videos
print('Creating index on id for videos...');
db.videos.createIndex({ "id": 1 });

// Index on datetime for sorting
print('Creating index on datetime for videos...');
db.videos.createIndex({ "datetime": -1 });

// Compound index for efficient queries by email and test id
print('Creating compound index on email+id for videos...');
db.videos.createIndex({ "email": 1, "id": 1 });

// ==================================================
// TEST SUITES COLLECTION SETUP
// ==================================================

print('Creating test_suites collection...');
db.createCollection('test_suites');

// Index on username for filtering by user
print('Creating index on username for test_suites...');
db.test_suites.createIndex({ "username": 1 });

// Index on email for filtering by user email
print('Creating index on email for test_suites...');
db.test_suites.createIndex({ "email": 1 });

// Index on user_id for filtering by user ID
print('Creating index on user_id for test_suites...');
db.test_suites.createIndex({ "user_id": 1 });

// Index on created_by for filtering suites by creator email
print('Creating index on created_by for test_suites...');
db.test_suites.createIndex({ "created_by": 1 });

// Index on status for filtering by status
print('Creating index on status for test_suites...');
db.test_suites.createIndex({ "status": 1 });

// Index on created_at for sorting
print('Creating index on created_at for test_suites...');
db.test_suites.createIndex({ "created_at": -1 });

// Compound index for user + status queries
print('Creating compound index on username+status for test_suites...');
db.test_suites.createIndex({ "username": 1, "status": 1 });

// Compound index for user + created_at (for efficient recent suite queries)
print('Creating compound index on user_id+created_at for test_suites...');
db.test_suites.createIndex({ "user_id": 1, "created_at": -1 });

// ==================================================
// TEST RESULTS COLLECTION SETUP
// ==================================================

print('Creating test_results collection...');
db.createCollection('test_results');

// Index on username for filtering by user
print('Creating index on username for test_results...');
db.test_results.createIndex({ "username": 1 });

// Index on email for filtering by user email
print('Creating index on email for test_results...');
db.test_results.createIndex({ "email": 1 });

// Index on user_id for filtering by user ID
print('Creating index on user_id for test_results...');
db.test_results.createIndex({ "user_id": 1 });

// Index on suite_id for grouping results by suite
print('Creating index on suite_id for test_results...');
db.test_results.createIndex({ "suite_id": 1 });

// Index on test_name for searching specific tests
print('Creating index on test_name for test_results...');
db.test_results.createIndex({ "test_name": 1 });

// Compound index for efficient queries
print('Creating compound index on username+suite_id for test_results...');
db.test_results.createIndex({ "username": 1, "suite_id": 1 });

// ==================================================
// SAMPLE DATA - FOR TESTING ONLY
// ==================================================

// Insert a sample tester user for testing
print('Inserting sample tester user...');
db.users.insertOne({
  username: "testuser",
  email: "test@example.com",
  password: "test123",  // Plain text password (no JWT/hashing for now)
  role: "tester",       // Default role for regular users
  created_at: new Date(),
  updated_at: new Date()
});

// Insert an admin user for testing
print('Inserting sample admin user...');
db.users.insertOne({
  username: "admin",
  email: "admin@testops.com",
  password: "admin123",  // Plain text password (no JWT/hashing for now)
  role: "admin",         // Admin role for administrative users
  created_at: new Date(),
  updated_at: new Date()
});

// ==================================================
// VERIFICATION
// ==================================================

// Verify the setup
print('Verifying setup...');
var userCount = db.users.countDocuments();
print('Total users created: ' + userCount);

// List all collections
print('Collections in testops database:');
db.getCollectionNames().forEach(function(collection) {
  print('  - ' + collection);
});

// Display sample user structure
print('Sample user document structure:');
var sampleUser = db.users.findOne({ role: "tester" });
printjson(sampleUser);

print('=== MongoDB Initialization Complete ===');
