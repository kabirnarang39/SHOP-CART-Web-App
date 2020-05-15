const express = require('express');
const User=require('../models/user')
const {check,body}=require('express-validator/check');
const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login',[check('email').isEmail().withMessage('Cant find a user with this email!').normalizeEmail(),
body('password',
'Password Should Be valid')
.isLength({min:5}).
isAlphanumeric()
.trim()
], authController.postLogin);

router.post('/signup',[
check('email').isEmail().withMessage('Enter a valid Email')
.custom((value,{req})=>{
   return User.findOne({email:value})
    .then(userDoc=>{
      if(userDoc){
      return Promise.reject('Email already exists!')
      }
})
})
.normalizeEmail(),
body('password',
'Please enter a password with atleast 5 characters and a combination of numbers and text').isLength({min:5}).isAlphanumeric().trim(),
body('confirmPassword').trim()
.custom((value,{req})=>{
    if(value!==req.body.password){
        throw new Error('Passwords does not match!')
    }
    return true;
})
], authController.postSignup);

router.post('/logout', authController.postLogout);
router.get('/reset',authController.getReset)
router.post('/reset',authController.postReset)
router.get('/reset/:token',authController.getUpdatePassword)
router.post('/reset-password',authController.postNewPassword)
module.exports = router;