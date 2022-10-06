const cookieSession = require("cookie-session");
const express = require("express");
const bcrypt = require("bcryptjs");
 
const app = express();
const PORT = 8080; // default port 8080


// ********* FUNKYTONS & VARIABLES ********* //
const generateRandomString = function() {
  const alpha = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let newString = "";
  for (let i = 0; i < 6; i++) {
    newString += alpha.charAt(Math.random() * alpha.length);
  }
  return newString;
};

const findUserByEmail = function(email, database) {
  for (let user in database) {
    if (database[user]["email"] === email) {
      return user;
    }
  }
  return null;
};

const urlsForUser = function(id) {
  let newDB = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url]["userID"] === id) {
      newDB[url] = urlDatabase[url];
    }
  }
  return newDB;
};

// ********* MIDDLEWARE ********* //
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'giftshop',
  keys: ["blackbeard's bar and grill and other delicacies and delights and fishing equipment"],
}));


// ********* DATABASES ********* //
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};


////////////////////////////////
// ********* ROUTES ********* //
////////////////////////////////

// ********* GET ********* //
app.get("/", (req, res) => {
  res.redirect("/urls");
});


app.get("/register", (req, res) => {
  if (req.session.userId) {
    return res.redirect("/urls");
  }

  const templateVars = { user: users[req.session.userId] };
  res.render("urls_register", templateVars);
});


app.get("/login", (req, res) => {
  if (req.session.userId) {
    return res.redirect("/urls");
  }

  const templateVars = { user: users[req.session.userId] };
  res.render("urls_login", templateVars);
});


app.get("/urls/new", (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  const templateVars = { user: users[req.session.userId] };
  res.render("urls_new", templateVars);
});


app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("Uh-oh! This ID does not exist.");
  }
  if (!req.session.userId) {
    return res.status(401).send("Please login first to access your URL.");
  }
  if (req.session.userId !== urlDatabase[req.params.id]["userID"]) {
    return res.status(401).send("You don't own this URL!");
  }

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id]["longURL"],
    user: users[req.session.userId]
  };

  res.render("urls_show", templateVars);
});


app.get("/urls", (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  const templateVars = {
    urls: urlsForUser(req.session.userId),
    user: users[req.session.userId]
  };

  res.render("urls_index", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]["longURL"];

  if (!longURL) {
    return res.status(404).send("Uh-oh! This ID does not exist.");
  }

  res.redirect(longURL);
});


// ********* POST ********* //
app.post("/register", (req, res) => {
  if (findUserByEmail(req.body.email, users)) {
    return res.status(400).send("This email already exists.");
  }
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("No fields can be empty!");
  }

  let newId = generateRandomString();
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);


  users[newId] = {
    id: newId,
    email: req.body.email,
    password: hashedPassword
  };

  console.log(users); // DEBUGGING
  req.session.userId = newId;
  res.redirect("/urls");
});


app.post("/login", (req, res) => {
  let user = users[findUserByEmail(req.body.email, users)];

  if (!user || !bcrypt.compareSync(req.body.password, user["password"])) {
    return res.status(400).send("Yikes! Invalid credentials.");
  }
  req.session.userId = user["id"];
  res.redirect("/urls");
});


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});


app.post("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("Uh-oh! This ID does not exist.");
  }
  if (!req.session.userId) {
    return res.status(401).send("Please login first to access your URL.");
  }
  if (req.session.userId !== urlDatabase[req.params.id]["userID"]) {
    return res.status(401).send("You don't own this URL!");
  }

  urlDatabase[req.params.id] = {
    longURL: `http://www.${req.body.longURL}`,
    userID: req.session.userId
  };

  res.redirect("/urls");
});


app.post("/urls/:id/delete", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("Uh-oh! This ID does not exist.");
  }
  if (!req.session.userId) {
    return res.status(401).send("Please login first to access your URL.");
  }
  if (req.session.userId !== urlDatabase[req.params.id]["userID"]) {
    return res.status(401).send("You don't own this URL!");
  }

  delete urlDatabase[req.params.id];

  res.redirect("/urls");
});


app.post("/urls", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send("Please login first.");
  }

  let id = generateRandomString();
  urlDatabase[id] = {
    longURL: `http://www.${req.body.longURL}`,
    userID: req.session.userId
  };

  console.log(urlDatabase); // DEBUGGING
  res.redirect(`/urls/${id}`);
});


// ********* LISTEN ********* //
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});