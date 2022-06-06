const express = require('express')
const dotenv = require('dotenv')
const passport =require('passport')
const session = require('express-session')
const path = require('path')
const mongoose = require('mongoose')
const MongoStore = require('connect-mongo')
const flash = require('express-flash')
const connectDB = require('./config/db')

//load config
dotenv.config({path:'./config/config.env'})
require('./config/passport')(passport)

connectDB()

const app = express()

app.set('view-engine','ejs')
//body parser
app.use(express.urlencoded({extended:false}))
//use flash
app.use(flash())

//sessions
app.use(session({
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    
}))
//passport middleware
app.use(passport.initialize())
app.use(passport.session())
//set glopal variables 
app.use(function(req,res,next){
    res.locals.user= req.user || null
    next()
})

//static folder
app.use(express.static(path.join(__dirname,'public')))

//routes
app.use('/', require('./routes/index'))
app.use('/', require('./routes/auth'))
app.use('/admin', require('./routes/admin'))
  


const PORT=process.env.PORT

app.listen(PORT,console.log(`app is running on  http:/localhost/${PORT} `))