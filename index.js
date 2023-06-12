const bodyParser = require("body-parser");
const express = require("express");
const flash = require("connect-flash");
const morgan = require("morgan");
const { default: mongoose } = require("mongoose");
require("dotenv").config();
const path = require("path");
const session = require("express-session");
const methodOverride = require("method-override");

const app = express();
const User = require("./models/users");

// sessions 
app.use(session({
	secret:'happy dog',
	saveUninitialized: true,
	resave: true
}));

// middlewares 
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
app.set("view engine", "ejs");
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(methodOverride("_method"));

// flash message 
app.use((req, res, next) => {
  res.locals.successMessage = req.flash('success');
  res.locals.errorMessage = req.flash('error');
  next();
});

port = process.env.PORT;

mongoose.connect(process.env.MONGODB_STRING).then(() => {
  console.log("connected to the database");
})

// home page along with form 
app.get("/", async (req, res) => {
  res.render("home")
});

// add user to database 
app.post("/", async (req, res) => {
  try {
    const user = new User(req.body.user);
    await user.save();
    req.flash('success', 'successfully added the user');
    res.redirect("/");
  } catch (e) {
    console.log(e.message);
    req.flash('error', e.message);
  }
});

// display users to the screen 
app.get("/users", async(req, res) => {
  try {
    const allUsers = await User.find({});
    res.render("displayUser", { allUsers });
  } catch (e) {
    req.flash('error', e.message);
  }
});

// edit user form get
app.get("/users/:id/edit", async(req, res) => {
  try {
    const userData = await User.findById(req.params.id);
    res.render("edit", { foundUser: userData });
  } catch (e) {
    req.flash('error', e.message);
  }
});

//now edit the user
app.put("/users/:id", async (req, res) => {
  try {
    const editedUser = await User.findByIdAndUpdate(req.params.id, req.body.user);
    if(!editedUser) {
      req.flash("error", "failed to update user");
      res.redirect(`/users/${req.params.id}/edit`);
    }
    req.flash("success", "successfully edited the user");
    res.redirect("/users");
  } catch (e) {
    req.flash('error', e.message);
  }
});

// delete user 
app.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    req.flash('success', 'successfully deleted the user');
    res.redirect("/users");
  } catch (e) {
    req.flash('error', e.message);
  }
});

app.listen(port, () => {
  console.log("app started on port " + port);
});