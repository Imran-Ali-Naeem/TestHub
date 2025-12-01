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
