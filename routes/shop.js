const express=require('express');
const isAuth=require('../middleware/is-auth')
const path=require('path');
const mainDir=require('../util/path')
const shopControllers=require('../controllers/shop')
const adminRoutes=require('./admin')
const router=express.Router();
router.get('/',shopControllers.getIndex)
router.get('/products',shopControllers.getProducts)

router.get('/products/:id',shopControllers.getProductsById)
router.get('/cart',isAuth,shopControllers.getCart)
router.post('/cart',isAuth,shopControllers.postCart)
router.post('/cart-delete-item',isAuth,shopControllers.postDeleteCartProduct)
router.get('/checkout', isAuth, shopControllers.getCheckout);
router.get('/checkout/success', isAuth, shopControllers.getCheckoutSuccess);
router.get('/checkout/cancel', isAuth, shopControllers.getCheckout);
//router.post('/create-order',isAuth,shopControllers.postOrder)
router.get('/orders',isAuth,shopControllers.getOrders)
router.get('/orders/:orderId',isAuth,shopControllers.getInvoice);



module.exports=router;