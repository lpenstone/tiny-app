
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');

app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

// ----------------------------------Database --------------------------//
var urlDatabase = {
  "userRandomID": {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
},
  "user2RandomID": {
    "b2xV6y": "http://www.hello.ca",
    "9sm45K": "http://www.hi.com"
  }
}

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10);
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10);
  }
}

function generateRandomString() {
  let shorter = '';
  const options = ['a', 'b', 'c', 'd', 'e', 'f',
                   'g', 'h', 'i', 'j', 'k', 'l',
                   '0', '1', '2', '3', '4', '5',
                   '6', '7', '8', '9'];
  let i = 0;
  while (i < 6){
    let random = Math.floor(Math.random() * options.length);
    shorter += options[random];
    i++
  }
  return shorter;
}


// ----------------------------------Pages --------------------------//

//HOMEPAGE
app.get("/", (req, res) => {
  let templateVars = { user: users[req.cookies['user_id']] }; //user: users[req.cookies['user_id']]
  res.status(200);
  res.render("index", templateVars);
  //res.send('See our list of short URLs <a href="/urls">here</a>');
});

//PAGE WITH FORM TO SUBMIT LONG URL -----------------USER NEEDED
app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.cookies['user_id']] };
  if (!req.cookies['user_id']){
    res.status(401);
    res.redirect("/login");
  } else {
    res.status(200);
    res.render("urls_new", templateVars);
  }
});

//SHOWS A SPECIFIC SHORTENED URL --------------------USER NEEDED
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, urls: urlDatabase, user: users[req.cookies['user_id']] };
  let user = req.cookies['user_id'];
  let id = req.params.id;
  if (!user){
    res.status(401);
    res.redirect("/login");
  } else {
    if (!urlDatabase[user][id]){
      res.status(401);
      res.send('Sorry this is not your link.')
    } else {
      res.status(200);
      res.render("urls_show", templateVars);
    }
  }
});

//DATABASE LIST JSON
app.get("/urls.json", (req, res) => {
  let templateVars = { user: users[req.cookies['user_id']] };
  res.json(urlDatabase, templateVars);
});

//LIST THE SHORT URLS WITH PAIRED LONG URLS ---------USER NEEDED
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies['user_id']] };
    if (!req.cookies['user_id']){
    res.status(401);
    res.redirect("/login");
  } else {
    res.status(200);
    res.render("urls_index", templateVars);
  }
});

//REDIRECT TO LONGURL FROM GIVEN SHORT URL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  if (!urlDatabase[req.params.shortURL])
  {
    res.status(404).send('That URL is incorrect.');
  } else {
  res.status(302)
  res.redirect(longURL); res.redirect(longURL);
  }
});

//TEST THE LIST OF USERS
app.get("/test", (req, res) => {
  let templateVars = { user: users[req.cookies['user_id']] };
  res.send(users);
});

//ONLINE LOGIN PAGE
app.get("/login", (req, res) => {
  let templateVars = { user: users[req.cookies['user_id']] };
  res.status(200);
  res.render("login", templateVars);
});

//ONLINE REGISTRATION PAGE
app.get("/register", (req, res) => {
  let templateVars = { user: users[req.cookies['user_id']] };
  res.status(200);
  res.render("register", templateVars);
});

// ----------------------------------Functions --------------------------//


//ONCE SUBMITTED THE FORM, GET GENERATED URL
app.post("/urls/new", (req, res) => {
  let id = generateRandomString();
  let user = req.cookies['user_id'];
  if (!urlDatabase[user]) {
    urlDatabase[user] = {};
    urlDatabase[user][id] = req.body.longURL;
  } else {
    urlDatabase[user][id] = req.body.longURL;
  }
  console.log(req.body);  // debug statement to see POST parameters
  res.status(302);
  res.redirect('/urls/'+ id);
});

//REGISTRATION
app.post("/register", (req, res) => {
  let id = generateRandomString();
  let status = false;
  for (var user in users){
    if (users[user]['email'] === req.body.email){
      status = true;
    }
  }
  if (status === true){
    res.status(400);
    res.send('That email has already been registered');
  } else {
    users[id] = { 'id': id,
                  'email': req.body.email,
                  'password': bcrypt.hashSync(req.body.password, 10);
                };
    res.cookie('user_id', id);
    res.status(302);
    res.redirect('/urls');
  }
});

//DELETES THE URL UPON REQUEST
app.post("/urls/:id/delete", (req, res) => {
  let id = req.params.id;
  let user = req.cookies['user_id'];
  delete urlDatabase[user][id];
  res.status(302);
  res.redirect('/urls');
});

//LOGIN
app.post("/login", (req, res) => {
  let status = false;
  for (var user in users){
    if (users[user]['email'] === req.body.email){
      if (users[user]['password'] === req.body.password){
        status = true;
        let id = users[user]['id'];
        res.cookie('user_id', id);
        res.status(302);
        res.redirect('/');
      } else {
        res.status(400);
        res.send('That password is incorrect.');
      }
    }
  }
  if (status === false){
    res.status(400);
    res.send('That email does not exist.');
  }
});

//LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/');
});

//UPDATES THE URL
app.post("/urls/:id/update", (req, res) => {
  let user = req.cookies['user_id'];
  let id = req.params.id
  urlDatabase[user][id] = req.body.modifyURL;
  res.status(302);
  res.redirect('/urls/' + id);
});


// ----------------------------------Terminal --------------------------//
//DISPLAY IN TERMINAL
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});