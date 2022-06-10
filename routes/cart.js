const express = require("express");
const router = express.Router();

const Cart = require("../models/cart");
const Product = require("../models/Product");

router.get("/add/:id", function (req, res) {
  const productId = req.params.id;
  const cart = new Cart(req.session.cart ? req.session.cart : {});

  Product.findById(productId, function (err, product) {
    if (err) {
      return res.redirect("/products");
    }
    cart.add(product, product.id);
    req.session.cart = cart;
    res.redirect("/products");
  });
});

router.get("/reduce/:id", function (req, res, next) {
  const productId = req.params.id;
  const cart = new Cart(req.session.cart ? req.session.cart : {});
  cart.reduceByOne(productId);
  req.session.cart = cart;
  res.redirect("/cart");
});

router.get("/remove/:id", function (req, res, next) {
  const productId = req.params.id;
  const cart = new Cart(req.session.cart ? req.session.cart : {});
  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect("/cart");
});

router.get("/", function (req, res, next) {
  if (!req.session.cart) {
    return res.render("cart.ejs", { products: null });
  }
  const cart = new Cart(req.session.cart);
  return res.render("cart.ejs", {
    products: cart.generateArray(),
    totalPrice: cart.totalPrice,
  });
});

module.exports = router;
