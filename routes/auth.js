const express = require("express");
const router = express.Router();
const { ensureAuth, ensureGuest } = require("../middleware/auth");
const User = require("../models/User");
const argon2 = require("argon2");
const passport = require("passport");
//login page
router.get("/login", ensureGuest, (req, res) => {
  res.render("login.ejs");
});

// POST login
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/products",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

//register page
router.get("/register", ensureGuest, (req, res) => {
  res.render("register.ejs");
});

// POST register
router.post("/register", async (req, res) => {
  try {
    let hash = await argon2.hash(req.body.password);
    const newUser = {
      name: req.body.name,
      email: req.body.email,
      password: hash,
    };
    let user = await User.findOne({ email: newUser.email });
    if (user) {
      //console.log("user already exist")
      res.render("emailExist.ejs");
    } else {
      user = await User.create(newUser);
      res.render("successfullRegister.ejs");
    }
  } catch (error) {
    console.log(err);
    res.redirect("/register");
  }
});
//@route GET /logout
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

module.exports = router;
