const express = require('express');
const router = express.Router();
const {ensureAuth, ensureGuest} = require('../middleware/auth');


//home page
router.get('/', (req,res)=>{
    res.render('index.ejs');
});






module.exports = router ;