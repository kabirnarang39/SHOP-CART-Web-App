const mongoose=require('mongoose')
const Product=require('../models/product')
const deleteHelper=require('../util/file')
//const Cart=require('../models/cart')
const {validationResult}=require('express-validator/check')
const getAddProducts=(req,res,next)=>{
    
    res.render('admin/edit-product',{
        pageTitle:'Add Product',
        path:'/admin/add-product',
        editing:false,
        hasErrors:false,
        error:null,
        validationErrors:[]
    })
    }
    const postAddProducts=(req,res,next)=>{
        const title=req.body.title;
        const image=req.file;
       const description=req.body.description;
        const price=req.body.price;
       if(!image){
        return res.status(422).render('admin/edit-product',{
            editing:false,
            hasErrors:true,
            path:'/admin/add-product',
            pageTitle:'Add Product',
            product:{
                title:title,
                description:description,
                price:price
            },
            error:'Attached file is not an image',
            validationErrors:[]
        })
    
         }
        
        const errors=validationResult(req);
        if(!errors.isEmpty()){
            return res.status(422).render('admin/edit-product',{
                editing:false,
                hasErrors:true,
                path:'/admin/add-product',
                pageTitle:'Add Product',
                product:{
                    title:title,
                    description:description,
                    price:price
                },
                error:errors.array()[0].msg,
                validationErrors:errors.array() 
            })
           
        }
        const imageUrl=image.path;
        const product=new Product({title:title,imageUrl:imageUrl,description:description,price:price,userId: req.user._id});
        product.save()
        .then((result)=>{
            console.log("Created Product");
            res.redirect('/admin/products')

        }).catch((err)=>{
           const error=new Error(err);
           error.httpStatusCode=500;
           return next(error);
        })
        
    }
   const getEditproduct=(req,res,next)=>{
        const editMode=req.query.edit;
        const prodId=req.params.id;
        if(!editMode){
            return res.redirect('/');
        }
        Product.findById(prodId)
        .then(product=>{
            if(!product){
                return res.redirect('/');
             }
             res.render('admin/edit-product',{
                 editing:editMode,
                 path:'/admin/edit-product',
                 pageTitle:'Edit Product',
                 product:product,
                 hasErrors:false,
                 error:null,
                 validationErrors:[]
     
             })
        }).catch(err=>{
            const error=new Error(err);
            error.httpStatusCode=500;
            return next(error);
        })
       

    }
    const postEditProduct=(req,res,next)=>{
        const id=req.body.productId;
        const title=req.body.title;
        const image=req.file;
        const price=req.body.price;
        const description=req.body.description;
        const errors=validationResult(req);
        if(!errors.isEmpty()){
            return res.status(422).render('admin/edit-product',{
                editing:true,
                hasErrors:true,
                path:'/admin/edit-product',
                pageTitle:'Edit Product',
                product:{
                    title:title,
                    description:description,
                    price:price,
                    _id:id
                },
                error:errors.array()[0].msg   ,
                validationErrors:errors.array() 
            })
        }
        Product.findById(id)
        .then(product=>{
            if(product.userId.toString()!==req.user._id.toString()){
               return res.redirect('/')
            }
            product.title=title;
            if(image){
               deleteHelper.deleteFile(product.imageUrl)
                product.imageUrl=image.path;
            }
           
            product.price=price;
            product.description=description;
            return product.save()
            .then((result)=>{
                res.redirect('/admin/products');
                console.log("UPDATED PRODUCT")
               })
        })
       .catch((err)=>{
            const error=new Error(err);
            error.httpStatusCode=500;
            return next(error);
         })
        
    }
    const deleteProduct=(req,res,next)=>{
        const id=req.params.id;
        Product.findById(id)
        .then(product=>{
            if(!product){
                return next(new Error('Product not found'))
            }
            deleteHelper.deleteFile(product.imageUrl);
            return  Product.deleteOne({_id:id,userId:req.user._id})
        }).then(result=>{
               console.log("PRODUCT DELETED");
               res.status(200).json({
                   message:'Successful Deletion!'
               })
           })
           .catch((err)=>{
            res.status(500).json({
                message:'Deletion Failed!'
            })
         })
           

    }
    const getProducts=(req,res,next)=>{
        Product.find({userId:req.user._id})
        .then(products=>{
            res.render('admin/products',{
                pageTitle:'Admin Products',
                path:'/admin/products',
                products:products
            })
        }).catch((err)=>{
            const error=new Error(err);
            error.httpStatusCode=500;
           return next(error);
         })

    }
    module.exports={
        getAddProducts:getAddProducts,
        postAddProducts:postAddProducts,
        getProducts:getProducts,
        getEditproduct:getEditproduct,
        postEditProduct:postEditProduct,
        deleteProduct:deleteProduct
    }