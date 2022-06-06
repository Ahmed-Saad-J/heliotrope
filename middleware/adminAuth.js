module.exports = {
    isAdmin: function(req,res,next){
        if(req.session.isAdmin==true){
            return next();
        }else{
            res.redirect('/admin/login');
        }
    },
   
}