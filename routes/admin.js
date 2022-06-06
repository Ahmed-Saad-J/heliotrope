const express = require("express");
const argon2 = require("argon2");
//const { redirect } = require('express/lib/response')
const session = require("express-session");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { isAdmin } = require("../middleware/adminAuth");
const Product = require("../models/Product");
const router = express.Router();
//const {ensureAuth, ensureGuest} = require('../middleware/auth');

//GET log in
router.get("/login", (req, res) => {
  res.render("admin/login.ejs");
});
//POST log in

router.post("/login", async (req, res) => {
  let hash = await argon2.hash(req.body.password);
  if (
    req.body.email == process.env.ADMIN_EMAIL &&
    (await argon2.verify(process.env.ADMIN_PASSWORD, req.body.password))
  ) {
    req.session.isAdmin = true;
    res.redirect("/admin");
  } else {
    console.log(process.env.ADMIN_PASSWORD);
    console.log(hash);
    res.redirect("/admin/login");
  }
});

//GET /admin
router.get("/", isAdmin, (req, res) => {
  res.render("admin/index.ejs");
});

//log out

router.get("/logout", isAdmin, (req, res) => {
  req.session.isAdmin = false;
  res.redirect("/admin/login");
});

// set up multer to upload product's images
let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

let upload = multer({ storage: storage });

//GET /admin/add
router.get("/add", isAdmin, (req, res) => {
  res.render("admin/addProduct.ejs");
});

//POST /admin/add
router.post("/add", isAdmin, upload.single("image"), (req, res, next) => {
  const newProduct = {
    title: req.body.title,
    description: req.body.desc,
    quantity: parseInt(req.body.quantity),
    price: parseInt(req.body.price),
    img: {
      data: fs.readFileSync(
        path.join(__dirname, "..", "uploads", req.file.filename)
      ),
      contentType: "image/png",
    },
  };
  Product.create(newProduct, (err, item) => {
    if (err) {
      console.log(err);
    } else {
      // item.save();
      res.redirect("/admin/all");
    }
  });
});

//GET /admin/products
router.get("/products", isAdmin, (req, res) => {
  Product.find({}, (err, products) => {
    if (err) {
      console.log(err);
      res.status(500).send("An error occurred", err);
    } else {
      res.render("admin/products.ejs", { products: products });
    }
  });
});

module.exports = router;