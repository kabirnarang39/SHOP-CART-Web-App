module.exports=(req,res,next)=>{
    if(!req.session.isLoggedIn){
        req.flash('error','You need to LogIn !!')
        return res.redirect('/login')
    }
    next();
}