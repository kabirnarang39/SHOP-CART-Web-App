const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const userSchema=new Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    resetToken:String,
    resetTokenExpiration:Date,
    cart:{
        items:[{
            productId:{
                type:Schema.Types.ObjectId,
                ref:'Product',
                required:true
            },
            quantity:{
                type:String,
                required:true
            }
            ,price:Number
        }]
    }
})
userSchema.methods.addToCart = function(product) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
      return cp.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];
    let price=parseInt(product.price);
    console.log(price)
    if (cartProductIndex >= 0) {
      newQuantity = parseInt(this.cart.items[cartProductIndex].quantity) + 1;
      price=price*newQuantity;
      console.log(price)
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        productId: product._id,
        quantity: newQuantity,
        price:price
      });
    }
    const updatedCart = {
      items: updatedCartItems
    };
    this.cart = updatedCart;
    return this.save();
  };
userSchema.methods.deleteFromCart=function(productId){
    const cartItems=this.cart.items.filter(items=>{
        return items.productId.toString()!==productId.toString();
    });
    this.cart.items=cartItems;
    return this.save();
}
userSchema.methods.clearCart=function(){
    this.cart.items=[]
    this.save()
}
module.exports=mongoose.model('User',userSchema);















/*const mongodb=require('mongodb');
const getDb=require('../util/database').getDb;
class User{
    constructor(name,email,cart,id){
        this.name=name;
        this.email=email;
        this.cart=cart;  //{items:[]}
        this._id=id;    
    }
    save(){
        const db=getDb();
        return db.collection('users').insertOne(this)
        .then(user=>{
            return user;
        })
        .catch(err=>{
            console.log(err)
        });
    }
    addToCart(product){
    const cartProductIndex= this.cart.items.findIndex(cp=>{
        return cp.productId.toString()==product._id.toString();
    })
    let newQuantity=1;
    let updatedCartItems=[...this.cart.items];
    if(cartProductIndex>=0){
        newQuantity=this.cart.items[cartProductIndex].quantity+1;
        updatedCartItems[cartProductIndex].quantity=newQuantity;
    }else{
        updatedCartItems.push({
            productId:new mongodb.ObjectID(product._id),
            quantity:newQuantity
        });
    }
    let updatedCart={
        items:updatedCartItems
    }
    const db=getDb();
    return db.collection('users').updateOne({_id:new mongodb.ObjectID(this._id)},
    {$set:{cart:updatedCart}})
    .then(result=>{
        console.log(result)
    })
    .catch(err=>{
        console.log(err)
    })
}
getOrder(){
    const db=getDb();
   return db.collection('orders').find({'user._id':new mongodb.ObjectID(this._id)})
    .toArray()
}
    addOrder(){
    const db=getDb()
   return this.getCart()
   .then(products=>{
        const order={
            items:products,
            user:{
                _id:new mongodb.ObjectID(this._id),
                name:this.name
            }
        }
        return db.collection('orders').insertOne(order)
    })
  .then(result=>{
        this.cart={items:[]};
       return db
       .collection('users').
       updateOne(
           {_id:new mongodb.ObjectID(this._id)},
           {$set:{cart:{items:[]}}}
           )
    })
    .catch(err=>{
        console.log(err)
    })
    }
    getCart(){
        const productIds=this.cart.items.map(i=>{
            return i.productId;
        })
        const db=getDb();
        return db.collection('products').find({_id:{$in:productIds}}).toArray()
        .then(products=>{
        return products.map(p=>{
        return{
            ...p,
            quantity:this.cart.items.find(i=>{
               return i.productId.toString()===p._id.toString()
            }).quantity
        }
        })
        })
        .catch(err=>{
            console.log(err);
        })
    }
    static findById(userId){
     const db=getDb();
    return db.collection('users').find({_id:new mongodb.ObjectID(userId)})
    .next()
    .then(user=>{
        return user;
    })
    .catch(err=>{
        console.log(err)
    })
    }
    deleteCartItemById(prodId){
        const db=getDb();
      const cartItems=this.cart.items.filter(items=>{
          return items.productId.toString()!==prodId.toString();
      })
      return db.collection('users').updateOne({_id:new mongodb.ObjectID(this._id)},
      {$set:{cart:{items:[...cartItemsn]}}})
      .then(result=>{
          console.log(result)
      })
      .catch(err=>{
          console.log(err)
      })

    }
}
module.exports=User;*/