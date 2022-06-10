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
router.get("/", (req, res) => {
  res.redirect("/admin/login");
});
//GET log in
router.get("/login", (req, res) => {
  res.render("admin/login.ejs", { isAdmin: req.session.isAdmin });
});
//POST log in

router.post("/login", async (req, res) => {
  let hash = await argon2.hash(req.body.password);
  if (
    req.body.email == process.env.ADMIN_EMAIL &&
    (await argon2.verify(process.env.ADMIN_PASSWORD, req.body.password))
  ) {
    req.session.isAdmin = true;
    res.redirect("/admin/products");
  } else {
    console.log(process.env.ADMIN_PASSWORD);
    console.log(hash);
    res.redirect("/admin/login");
  }
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
  res.render("admin/addProduct.ejs", { isAdmin: req.session.isAdmin });
});

//POST /admin/product/add
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
      fs.unlink(
        path.join(__dirname, "..", "uploads", req.file.filename),
        (err) => {
          if (err) throw err;
        }
      );
      res.redirect("/admin/products");
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
      res.render("admin/products.ejs", {
        products: products,
        isAdmin: req.session.isAdmin,
      });
    }
  });
});
// delete product
router.delete("/delete/:id", isAdmin, async (req, res) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).send("this page doesn't exist");
  }
  //fs.unlink
  product = await Product.deleteOne({ _id: req.params.id });
  res.redirect("/admin/products");
});

//GET edit
router.get("/edit/:id", isAdmin, async (req, res) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).send("this page doesn't exist");
  }
  res.render("admin/update.ejs", {
    product: product,
    isAdmin: req.session.isAdmin,
  });
});
// post edit
router.post("/edit/:id", isAdmin, upload.single("image"), async (req, res) => {
  let product = await Product.findById(req.params.id).lean();
  if (!product) {
    return res.status(404).send("this page doesn't exist");
  }
  console.log(req.body);
  product = await Product.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true,
    runValidators: true,
  });
  //check if an image is updated
  if (req.file) {
    let img = {
      data: fs.readFileSync(
        path.join(__dirname, "..", "uploads", req.file.filename)
      ),
      contentType: "image/png",
    };
    product.img = img;
    await product.save();
  }
  res.redirect("/admin/products");
});

module.exports = router;
