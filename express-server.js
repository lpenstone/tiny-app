
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");



var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

//PAGE WITH FORM TO SUBMIT LONG URL
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//ONCE SUBMITTED THE FORM, GET GENERATED URL
app.post("/urls", (req, res) => {
  let tiny = generateRandomString()
  urlDatabase[tiny] = req.body.longURL;
  console.log(req.body);  // debug statement to see POST parameters
  res.status(302);
  res.redirect('/urls/'+ tiny);         // Respond with 'Ok' (we will replace this)
});

//DELETES THE PAGE UPON REQUEST
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.status(302);
  res.redirect('/urls');
});

//UPDATES THE URL
app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body.modifyURL;
  res.status(302);
  res.redirect('/urls/' + req.params.id);
});

//HOMEPAGE
app.get("/", (req, res) => {
  res.send('See our list of short URLs <a href="/urls">here</a>');
});

//DATABASE LIST JSON
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//LIST THE SHORT URLS WITH PAIRED LONG URLS
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
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

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, urls: urlDatabase };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});