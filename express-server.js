
// ------------------------------ Initialize Modules ------------------------------//
const express = require("express");
const app = express();

const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session')

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000
}));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

// ---------------------------------- Databases -------------------------------//

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
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
}

// ---------------------------------- Function ------------------------------//
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


// ---------------------------------- Pages ------------------------------//

//HOMEPAGE
app.get("/", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  res.status(200);
  res.render("index", templateVars);
});

//LOGIN
app.get("/login", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  res.status(200);
  res.render("login", templateVars);
});

//REGISTRATION
app.get("/register", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  res.status(200);
  res.render("register", templateVars);
});

//SUBMIT long URL <--USER NEEDED-->
app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  if (!req.session.user_id){
    res.status(401);
    res.redirect("/login");
  } else {
    res.status(200);
    res.render("urls_new", templateVars);
  }
});

//LIST a specific URL and it's shortened version <--USER NEEDED-->
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, urls: urlDatabase, user: users[req.session.user_id] };
  let user = req.session.user_id;
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


//LIST the short URLs with paired long URLs <--USER NEEDED-->
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.session.user_id] };
    if (!req.session.user_id){
    res.status(401);
    res.redirect("/login");
  } else {
    res.status(200);
    res.render("urls_index", templateVars);
  }
});

//REDIRECT to long URL from short URL
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


//DATABASE LIST .JSON
app.get("/urls.json", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  res.json(urlDatabase, templateVars);
});

// ---------------------------------- CURD ---------------------------------//

//REGISTRATION
app.post("/register", (req, res) => {
  let id = generateRandomString();
  let email = req.body.email;
  let status = false;
  //for (let i = 0; i < )
  for (let user in users){
    //Checking if email has been registered
    if (users[user]['email'] === email){
      status = true;
    }
  }
  if (status === true){
    //If email has been registered, notify
    res.status(400);
    res.send('That email has already been registered');
  } else {
    //If email has not been registered, register new
    users[id] = { 'id': id,
                  'email': req.body.email,
                  'password': bcrypt.hashSync(req.body.password, 10)
                };
    req.session.user_id = id;
    res.status(302);
    res.redirect('/urls');
  }
});

//LOGIN
app.post("/login", (req, res) => {
  let status = false;
  for (var user in users){
    if (users[user]['email'] === req.body.email){
      //Success email
      if (bcrypt.compareSync(req.body.password, users[user]['password'])){
        //Success password
        status = true;
        let id = users[user]['id'];
        req.session.user_id = id;
        res.status(302);
        res.redirect('/');
      } else {
        //Unsuccessful password
        res.status(400);
        res.send('That password is incorrect.');
      }
    }
  }
  if (status === false){
    //Unsuccessful email
    res.status(400);
    res.send('That email does not exist.');
  }
});

//LOGOUT
app.post("/logout", (req, res) => {
  req.session = null; //res.clearCookie('user_id');
  res.redirect('/');
});

//NEW URL - generate new URL
app.post("/urls/new", (req, res) => {
  let urlID = generateRandomString();
  let user = req.session.user_id;
  if (!urlDatabase[user]) { //If user does not exist in database, create new object
    urlDatabase[user] = {};
    urlDatabase[user][urlID] = req.body.longURL; //Add URL to new object
  } else {
    urlDatabase[user][urlID] = req.body.longURL; //If user does exist, add URL to object
  }
  res.status(302);
  res.redirect('/urls/'+ id); //Redirect to the new URL listing
});

//UPDATES THE URL
app.post("/urls/:id/update", (req, res) => {
  let user = req.session.user_id;
  let id = req.params.id
  urlDatabase[user][id] = req.body.modifyURL;
  res.status(302);
  res.redirect('/urls/' + id);
});

//DELETES - Deletes the URL upon request
app.post("/urls/:id/delete", (req, res) => {
  let id = req.params.id;
  let user = req.session.user_id;
  delete urlDatabase[user][id];
  res.status(302);
  res.redirect('/urls');
});


// ---------------------------- Terminal Output --------------------------//
//DISPLAY IN TERMINAL
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});