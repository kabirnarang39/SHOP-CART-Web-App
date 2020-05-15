const crypto=require('crypto')
const bcrypt=require('bcryptjs');
const nodemailer=require('nodemailer');
const sendGridTransport=require('nodemailer-sendgrid-transport');
const {validationResult}=require('express-validator/check')
const User = require('../models/user');
const transport=nodemailer.createTransport(sendGridTransport({
  auth:{
    api_key:"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"
  }
}))

exports.getLogin = (req, res, next) => {
  let messageError=req.flash('error')
 
  if(messageError.length>0){
    messageError=messageError[0];
  }
  else{
    messageError=null;
  }
 
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    error:messageError,
    inputData:{
      email:'',
      password:'',
      confirmPassword:''
    },
    validationErrors:[]
  });
};

exports.getSignup = (req, res, next) => {
  let messageError=req.flash('error')
  
  if(messageError.length>0){
    messageError=messageError[0];
  }
  else{
    messageError=null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    error:messageError,
    inputData:{
      email:'',
      password:'',
      confirmPassword:''
    },
    validationErrors:[]

  });
};

exports.postLogin = (req, res, next) => {
  const email=req.body.email;
  const password=req.body.password;
  const errors=validationResult(req);
  if(!errors.isEmpty()){
    const messageError=errors.array()[0].msg;
   return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      error:messageError,
      inputData:{
        email:req.body.email,
        password:req.body.password,
        confirmPassword:req.body.confirmPassword
      },
      validationErrors:errors.array()
  
    });
  }
  User.findOne({email:email})
    .then(user => {
      if(!user){
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          error:'Invalid Password or Email!',
          inputData:{
            email:req.body.email,
            password:req.body.password,
            confirmPassword:req.body.confirmPassword
          },
          validationErrors:[]
      
        });

      }
      bcrypt.compare(password,user.password)
      .then(doMatch=>{
       if(doMatch){
        req.flash('success','Logged In Successfully !')
        req.session.isLoggedIn = true;
        req.session.user = user;
        return req.session.save(err => {
          console.log(err);
          res.redirect('/');
        });
       }
       return res.status(422).render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        error:'Invalid Password or Email!',
        inputData:{
          email:req.body.email,
          password:req.body.password,
          confirmPassword:req.body.confirmPassword
        },
        validationErrors:[]
    
      });

      })
      .catch(err=>{
        console.log(err)
        res.redirect('/login');
      })
      
    })
    .catch((err)=>{
      const error=new Error(err);
      error.httpStatusCode=500;
      return next(error);
   })
};

exports.postSignup = (req, res, next) => {
  const email=req.body.email;
  const password=req.body.password;
  const errors=validationResult(req);
  console.log(errors)
  if(!errors.isEmpty()){
    const messageError=errors.array()[0].msg;
   return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      error:messageError,
      inputData:{
        email:req.body.email,
        password:req.body.password,
        confirmPassword:req.body.confirmPassword
      },
      validationErrors:errors.array()
  
    });
  }
 bcrypt.hash(password,12)
    .then(hashedPassword=>{
      const user=new User({
        email:email,
        password:hashedPassword,
        cart:{items:[]}
      })
      return user.save();
    })
    .then(result=>{
      res.redirect('/login');
      return transport.sendMail({
        to:email,
        from:'narang0211@gmail.com',
        subject:'SignUp Successfull!',
        html:'<h1>Successfully Signed Up'
      })

  })
  .catch((err)=>{
    const error=new Error(err);
    error.httpStatusCode=500;
    return next(error);
 })
};

exports.postLogout = (req, res, next) => {

  req.session.destroy(err => {
    res.redirect('/');
  });
};
exports.getReset=(req,res,next)=>{
  let messageError=req.flash('error')
  if(messageError.length>0){
    messageError=messageError[0];
  }
  else{
    messageError=null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    error:messageError
});
}
exports.postReset=(req,res,next)=>{
crypto.randomBytes(32,(err,buffer)=>{
  if(err){
    console.log(err)
    return res.redirect('/reset');
  }
  const token=buffer.toString('hex')
  User.findOne({email:req.body.email})
  .then(user=>{
    if(!user){
      req.flash('error','No such user exists')
      return res.redirect('/reset');
    }
    user.resetToken=token;
    user.resetTokenExpiration=Date.now() + 3600000;
    console.log(user)
    return user.save()
  })
  .then(result=>{
    res.redirect('/')
    transport.sendMail({
      to:req.body.email,
      from:'narang0211@gmail.com',
      subject:'Reset Password',
      html:`<p>You requested for a change in resetting of password</p>
            <p><a href="http://localhost:3200/reset/${token}">Click this link to reset your password</a></p>
      `
    })
    
  })
  .catch((err)=>{
    const error=new Error(err);
    error.httpStatusCode=500;
    return next(error);
 })
})
}
exports.getUpdatePassword=(req,res,next)=>{
User.findOne({resetToken:req.params.token,resetTokenExpiration:{$gt:Date.now()}})
.then(user=>{
  let messageError=req.flash('error')
  if(messageError.length>0){
    messageError=messageError[0];
  }
  else{
    messageError=null;
  }

  res.render('auth/new-password', {
    path: '/reset-password',
    pageTitle: 'Update Password',
    error:messageError,
    userId:user._id,
    token:user.resetToken
});
})
.catch((err)=>{
  const error=new Error(err);
  error.httpStatusCode=500;
  return next(error);
})
}
exports.postNewPassword=(req,res,next)=>{
  let resetUser;
  User.findOne({
    resetToken:req.body.token,
    resetTokenExpiration:{$gt:Date.now()},
    _id:req.body.userId})
    .then(user=>{
      resetUser=user;
      return bcrypt.hash(req.body.password,12)
    })
    .then(hashedPassword=>{
      resetUser.password=hashedPassword;
      resetUser.resetToken=undefined;
      resetUser.resetTokenExpiration=undefined;
      return resetUser.save()
    })
    .then(result=>{
      res.redirect('/login')
    })
    .catch((err)=>{
      const error=new Error(err);
      error.httpStatusCode=500;
      return next(error);
   })
}