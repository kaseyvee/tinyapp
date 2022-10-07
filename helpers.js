const generateRandomString = function() {
  const alpha = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let newString = "";
  for (let i = 0; i < 6; i++) {
    newString += alpha.charAt(Math.random() * alpha.length);
  }
  return newString;
};

const urlsForUser = function(id, database) {
  let newDB = {};
  for (let url in database) {
    if (database[url]["userID"] === id) {
      newDB[url] = database[url];
    }
  }
  return newDB;
};

const findUserByEmail = function(email, database) {
  for (let user in database) {
    if (database[user]["email"] === email) {
      return user;
    }
  }
  return undefined;
};


module.exports = {
  generateRandomString,
  urlsForUser,
  findUserByEmail
};