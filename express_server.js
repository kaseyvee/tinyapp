const cookieParser = require('cookie-parser');
const express = require("express");
 
const app = express();
const PORT = 8080; // default port 8080

const generateRandomString = function() {
  const alpha = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let newString = "";
  for (let i = 0; i < 6; i++) {
    newString += alpha.charAt(Math.random() * alpha.length);
  }
  return newString;
};

const findUserByEmail = function(email) {
  for (let user in users) {
    if (users[user]["email"] === email) {
      return user;
    }
  }
  return null;
};

// ********* MIDDLEWARE ********* //
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// ********* DATABASES ********* //
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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


// ********* ROUTES ********* //

// ********* GET ********* //
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_login", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_register", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


// ********* POST ********* //
app.post("/register", (req, res) => {
  if (findUserByEmail(req.body.email)) {
    return res.status(400).send("This email already exists.");
  }
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("No fields can be empty!");
  } else {
    let newId = generateRandomString();
    users[newId] = {
      id: newId,
      email: req.body.email,
      password: req.body.password
    };
    console.log(users); // DEBUGGING
    res.cookie("user_id", newId);
    res.redirect(`/urls`);
  }
});

app.post("/login", (req, res) => {
  let user = users[findUserByEmail(req.body.email)];
  if (!user || user["password"] !== req.body.password) {
    return res.status(400).send("Yikes! Invalid credentials.");
  }
  res.cookie("user_id", user["id"]);
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id", req.body.newId);
  res.redirect(`/urls`);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = `http://www.${req.body.longURL}`;
  console.log(urlDatabase); // DEBUGGING
  res.redirect(`/urls`);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console DEBUGGING
  let id = generateRandomString();
  urlDatabase[id] = `http://www.${req.body.longURL}`;
  console.log(urlDatabase); // DEBUGGING
  res.redirect(`/urls/${id}`);
});


// ********* LISTEN ********* //
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});