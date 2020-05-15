const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const productSchema=new Schema({
    title:{
        type:String,
        required:true
    },
    imageUrl:{
        type:String,
        required:true  
    },
    price:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
        
    }
});
module.exports=mongoose.model('Product',productSchema);





















/*const mongodb=require('mongodb');
let dbO;
class Product{
    constructor(title,price,imageUrl,description,id,userId){
        this.title=title;
        this.price=price;
        this.imageUrl=imageUrl;
        this.description=description;
        this._id=id?new mongodb.ObjectID(id):null;
        this.userId=userId;
    }
    save(){
    const db=getDb();
    if(this._id){
       dbO=db.collection('products').updateOne({_id:this._id}, {$set: this})
       }
    else{
          dbO=db.collection('products').insertOne(this)
    }
 
    return dbO.
    then((result)=>{
        console.log(result)
    })
    .catch(err=>{
        console.log(err)
    });
    }
    static fetchAll(){
        const db=getDb()
        return db.collection('products').find()
        .toArray()
        .then(products=>{
            console.log(products);
            return products;
        })
        .catch(err=>{
            console.log(err)
        });
    }
    static findById(prodId){
        const db=getDb()
      return  db.collection('products').find({_id:new mongodb.ObjectID(prodId)})
        .next()
        .then(product=>{
            return product;
        })
        .catch(err=>{
            console.log(err);
        })
    }
    static deleteById(prodId){
        const db=getDb();
      return  db.collection('products').deleteOne({_id:new mongodb.ObjectID(prodId)})
        .then(()=>{
            console.log('deleted successfully')
        })
        .catch(err=>{
            console.log(err)
        })
    }

}

/*const Product=sequelize.define('product',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        primaryKey:true,
        allowNull:false
    },
    title:Sequelize.STRING,
    price:{
        type:Sequelize.DOUBLE,
        allowNull:false
    },
    imageUrl:{
type:Sequelize.STRING,
allowNull:false
    },
    description:{
type:Sequelize.STRING,
allowNull:false
    }
});
*/
//module.exports=Product;