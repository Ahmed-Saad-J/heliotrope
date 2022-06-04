const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const User = require('../models/User');
const argon2 = require('argon2');

module.exports = function(passport){
    passport.use(new LocalStrategy({
        usernameField: 'email'
    },async (email, password, done)=>{
        
        try {
            let user = await User.findOne({email: email});
            if(!user){
                // user = await User.create(newUser);
                 done(null, false,{message:'no user with that email'});
             }
           
            if(user && await argon2.verify(user.password, password)){
                done(null, user);
            }else{
                done(null, false,{message:'wrong password please try again '});
            }
            
        } catch (err) {
            
            console.log(err);
            done(err)
        }
    }
    ));
    passport.serializeUser((user,done)=>{
        done(null, user.id);
    });
    passport.deserializeUser((id ,done)=>{
        User.findById(id,(err, user)=>done(err, user));
    });
}