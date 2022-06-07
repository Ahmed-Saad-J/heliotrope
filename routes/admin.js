const express = require('express')
const argon2 = require('argon2')
const { redirect } = require('express/lib/response')
const session = require('express-session');
const{isAdmin} = require('../middleware/adminAuth')
const router = express.Router()
//const {ensureAuth, ensureGuest} = require('../middleware/auth');


//GET login
router.get('/login',(req,res)=>{
    res.render('admin/login.ejs')
})
//POST log in

router.post('/login', async(req,res)=>{

    let hash = await argon2.hash(req.body.password)
    if(req.body.email==process.env.ADMIN_EMAIL && await argon2.verify(process.env.ADMIN_PASSWORD, req.body.password)){
        req.session.isAdmin=true
        res.redirect('/admin') 
        
    }
    else{
        console.log(process.env.ADMIN_PASSWORD)
        console.log(hash)
        res.redirect('/admin/login')
    }
})

//GET login
router.get('/',isAdmin,(req,res)=>{
    res.render('admin/index.ejs')
})

//log out 

router.get('/logout',isAdmin,(req,res)=>{
    req.session.isAdmin= false
    res.redirect('/admin/login')
})

module.exports = router 