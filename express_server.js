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

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"]
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
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  console.log("username: ", req.body.username); // DEBUGGING
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});