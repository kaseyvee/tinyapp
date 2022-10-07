const { assert } = require('chai');

const { generateRandomString, urlsForUser, findUserByEmail } = require('../helpers.js');


// EXAMPLE DATABASES
const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testUrlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};


// TESTS
describe('generateRandomString', function() {
  it('should true if both strings are different', function() {
    const string1 = generateRandomString();
    const string2 = generateRandomString();
    assert.notStrictEqual(string1, string2);
  });
});

describe('urlsForUser', function() {
  it('should return object with urls made by user only', function() {
    const urls = urlsForUser("userRandomID", testUrlDatabase);
    const newObject = {
      b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "userRandomID"
      }
    };
    assert.deepEqual(urls, newObject);
  });

  it('should return empty object if user owns no urls', function() {
    const urls = urlsForUser("user2RandomID", testUrlDatabase);
    const newObject = {};
    assert.deepEqual(urls, newObject);
  });
});

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.strictEqual(user, expectedUserID);
  });

  it('should return undefined if email does not exist', function() {
    const user = findUserByEmail("userlol@example.com", testUsers);
    const expectedUserID = undefined;
    assert.strictEqual(user, expectedUserID);
  });
});