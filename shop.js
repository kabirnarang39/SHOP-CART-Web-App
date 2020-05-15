const fs=require('fs');
const PDFDocument = require('pdfkit');
const path=require('path')
const stripe=require('stripe')('sk_test_GlhgzWUHN2vLAKPPgbEGud8Q00cJ5VMlwO')
const Product=require('../models/product')
const Order=require('../models/orders')
const Products_per_page=4;
    const getProducts=(req,res,next)=>{
        const page=+req.query.page || 1;
        let totalItems;
       Product.find().countDocuments()
       .then(totalDocs=>{
           totalItems=totalDocs
        return Product.find()
        .skip((page-1)*Products_per_page)
        .limit(Products_per_page)
       })
        .then(products=>{
            res.render('shop/product-list',{
                pageTitle:'All Products',
                path:'/products',
                products:products,
                currentPage:page,
                totalItems:totalItems,
                hasNextPage:Products_per_page*page<totalItems,
                hasPreviousPage:page>1,
                nextPage:page+1,
                previousPage:page-1,
                lastPage:Math.ceil(totalItems/Products_per_page)
            })
        })
        .catch((err)=>{
            const error=new Error(err);
            error.httpStatusCode=500;
            return next(error);
         })
      
       
    }
     const getProductsById=(req,res,next)=>{
        const prodId=req.params.id;
        Product.findById(prodId)
        .then(product=>{
            res.render('shop/product-details',{
                path:'/products',
                product:product,
                pageTitle:'ProductDetails'
            })
        }).catch((err)=>{
            const error=new Error(err);
            error.httpStatusCode=500;
            return next(error);
         })
    }
    const getIndex=(req,res,next)=>{
        const page=+req.query.page || 1;
        let totalItems;
        let messageSuccess=req.flash('success');
        if(messageSuccess.length>0){
            messageSuccess=messageSuccess[0];
          }
          else{
            messageSuccess=null;
          }
          Product.find().countDocuments()
          .then(totalProductDocs=>{
          totalItems=totalProductDocs;
          return Product.find()
          .skip((page-1)*Products_per_page)
          .limit(Products_per_page)
          }).then(products=>{
            res.render('shop/index',{
                pageTitle:'Shop',
                path:'/',
                products:products,
                success:messageSuccess,
                currentPage:page,
                totalItems:totalItems,
                hasNextPage:Products_per_page*page<totalItems,
                hasPreviousPage:page>1,
                nextPage:page+1,
                previousPage:page-1,
                lastPage:Math.ceil(totalItems/Products_per_page)
            })
        })
        .catch((err)=>{
            const error=new Error(err);
            error.httpStatusCode=500;
            return next(error);
         })
        
     

    }
   const getCart=(req,res,next)=>{
        
        req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user=>{
            const products=user.cart.items;
            res.render('shop/cart',{
                path:'/cart',
                pageTitle:'Your Cart',
                products:products
            })
        })
        .catch((err)=>{
            const error=new Error(err);
            error.httpStatusCode=500;
            return next(error);
         })
        /*
            Product.fetchAll(products=>{
                const cartProducts=[];
            for(product of products){
           const cartProductData=cart.products.find(p=>p.id===product.id)
           if(cartProductData){
               cartProducts.push({productData:product , qty: cartProductData.qty});
           }
            }
            res.render('shop/cart',{
                path:'/cart',
                pageTitle:'Your Cart',
                products:cartProducts,
                totalPrice:cart.totalPrice
            })
            })
           
        })*/
        
    }
    const postDeleteCartProduct=(req,res,next)=>{
        const id=req.body.productId;
      req.user
      .deleteFromCart(id)
      .then(()=>{
           console.log("removed from cart");
           res.redirect('/cart');
       })
       .catch((err)=>{
        const error=new Error(err);
        error.httpStatusCode=500;
        return next(error);
     })

    }
   const postCart=(req,res,next)=>{
        const prodId=req.body.prodId;
        Product.findById(prodId)
        .then(product=>{
           return req.user.addToCart(product)
        })
        .then(result=>{
            console.log("added to cart")
            res.redirect('/cart')
        })
        .catch((err)=>{
            const error=new Error(err);
            error.httpStatusCode=500;
            return next(error);
         })

     /*  let fetchedCart;
        let newQuantity=1;
       req.user
       .getCart()
       .then(cart=>{
           fetchedCart=cart;
        return   cart.getProducts({where:{id:prodId}})
       })
       .then(products=>{
           let product;
           if(products.length>0){
               product=products[0];
           }
         
           if(product){
           const oldQuantity=product.cartItems.quantity;
           newQuantity=oldQuantity+1;
           return product;
           }
           return Product.findByPk(prodId)
          
           })
           .then(product=>{
            return  fetchedCart.addProduct(product,{through:{quantity:newQuantity}})
           .then(()=>{
               res.redirect('/cart')
               console.log("product added to cart");
           })
           .catch(err=>{
               console.log(err)
           })
       })
       .catch(err=>{
           console.log(err)
       })
        
    
    */ }

   const getOrders=(req,res,next)=>{
       Order.find({"user.userId":req.user._id})
        .then(orders=>{
            res.render('shop/orders',{
                path:'/orders',
                pageTitle:'Orders',
                orders:orders
            })
        })
        .catch((err)=>{
            const error=new Error(err);
            error.httpStatusCode=500;
            return next(error);
         })
       
    }
    const getCheckout = (req, res, next) => {
        let products;
        let total = 0;
        req.user
          .populate('cart.items.productId')
          .execPopulate()
          .then(user => {
            products = user.cart.items;
            total = 0;
            products.forEach(p => {
              total += p.quantity * p.productId.price;
            });
      
            return stripe.checkout.sessions.create({
              payment_method_types: ['card'],
              line_items: products.map(p => {
                return {
                  name: p.productId.title,
                  description: p.productId.description,
                  amount: p.productId.price * 100,
                  currency: 'usd',
                  quantity: p.quantity
                };
              }),
              success_url: req.protocol + '://' + req.get('host') + '/checkout/success', // => http://localhost:3000
              cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
            });
          })
          .then(session => {
            res.render('shop/checkout', {
              path: '/checkout',
              pageTitle: 'Checkout',
              products: products,
              totalSum: total,
              sessionId: session.id
            });
          })
          .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
          });
      };
      const getCheckoutSuccess=(req,res,next)=>{
         
        req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user=>{
            const products=user.cart.items.map(i=>{
            return {quantity:i.quantity, product:{...i.productId._doc} }
            });
            console.log(products)
            const order=new Order({
                products:products,
                user:{
                    email:req.user.email,
                    userId:req.user
                }
            })
            return order.save()
           
        })
          .then(result => {
            return req.user.clearCart()
           
          })
          .then(()=>{
            res.redirect('/orders');
          })
          .catch((err)=>{
            const error=new Error(err);
            error.httpStatusCode=500;
            return next(error);
         })
    }
      
    const postOrder=(req,res,next)=>{
         
        req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user=>{
            const products=user.cart.items.map(i=>{
            return {quantity:i.quantity, product:{...i.productId._doc} }
            });
            console.log(products)
            const order=new Order({
                products:products,
                user:{
                    email:req.user.email,
                    userId:req.user
                }
            })
            return order.save()
           
        })
          .then(result => {
            return req.user.clearCart()
           
          })
          .then(()=>{
            res.redirect('/orders');
          })
          .catch((err)=>{
            const error=new Error(err);
            error.httpStatusCode=500;
            return next(error);
         })
    }
    const getInvoice=(req,res,next)=>{
        const orderId=req.params.orderId;
        Order.findById(orderId)
        .then(order=>{
            if(!order){
                return next(new Error('Order not found!'));
            }
            if(order.user.userId.toString()!==req.user._id.toString()){
                return next(new Error("Not an authorized user"))
            }
            const invoiceName = 'invoice-' + orderId + '.pdf';
            const invoicePath = path.join('data', 'invoices', invoiceName);
      
            const pdfDoc = new PDFDocument();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
              'Content-Disposition',
              'inline; filename="' + invoiceName + '"'
            );
            pdfDoc.pipe(fs.createWriteStream(invoicePath));
            pdfDoc.pipe(res);
            let totalPrice=0;
            pdfDoc.text('Narang Trading Company',{
                align:'left'
            })
            pdfDoc.text('Amity University Haryana',{
                align:'left'
            })
            pdfDoc.text('Gurugram, 122413',{
                align:'left'
            })
            pdfDoc.text('narang0211@gmail.com',{
                align:'left'
            }).moveUp(4)
           
            pdfDoc.fontSize(30).text('INVOICE',{
                underline:true,
                align:'right'
            })
            pdfDoc.moveDown()
            pdfDoc.fontSize(20).text('----------------------------------------------------------------------');
            pdfDoc.fontSize(20).text('----------------------------------------------------------------------');
            order.products.forEach(product=>{
                
                totalPrice+=product.product.price*product.quantity;
               
                pdfDoc.fontSize(20).text("Item Name        ||       "+product.product.title)
                pdfDoc.moveDown()

                pdfDoc.fontSize(20).text(" Quantity           ||       "+ product.quantity)
                pdfDoc.moveDown()

                pdfDoc.fontSize(20).text(" Product price   ||        $ "+product.product.price + "*"+product.quantity)
                pdfDoc.text('----------------------------------------------------------------------');

              
            })
            pdfDoc.fontSize(20).text("Total                  ||        $ "+totalPrice)
            pdfDoc.end();
        })
        .catch(err=>{
            next(err);
        })
  
    }
   
    module.exports={
        getProducts:getProducts,
        getIndex:getIndex,
        getCart:getCart,
        getCheckout:getCheckout,
        getOrders:getOrders,
        getProductsById:getProductsById,
        postCart:postCart,
        postDeleteCartProduct:postDeleteCartProduct,
        postOrder:postOrder,
        getInvoice:getInvoice,
        getCheckoutSuccess:getCheckoutSuccess
    }