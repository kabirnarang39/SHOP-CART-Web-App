const express=require('express');
const {check,body}=require('express-validator/check');
const isAuth=require('../middleware/is-auth')
const path=require('path');
const mainDir=require('../util/path')
const adminControllers=require('../controllers/admin')
const router=express.Router();
router.get('/add-product',isAuth,adminControllers.getAddProducts)
router.get('/products',isAuth,adminControllers.getProducts)
router.post('/add-product',[
    check('title')
    .isString()
    .isLength({min:5})
    .trim(),
    body('price')
    .isFloat(),
    body('description')
    .isLength({min:5, max:400})
    .trim()
],isAuth,adminControllers.postAddProducts)
router.get('/edit-product/:id',isAuth,adminControllers.getEditproduct)
router.post('/edit-product',[
    check('title')
    .isString()
    .isLength({min:5})
    .trim(),
    body('price')
    .isFloat(),
    body('description')
    .isLength({min:5, max:400})
    .trim()
],isAuth,adminControllers.postEditProduct)
router.delete('/product/:id',isAuth,adminControllers.deleteProduct)
module.exports=router;