const path = require('path');
var uniqid = require('uniqid');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const mongoDBStore=require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const errorController=require('./controllers/error');
const User=require('./models/user');
const app=express();
const store=new mongoDBStore({
    uri:'mongodb+srv://Kabir:9416285188@cluster0-rsbgg.mongodb.net/shop',
    collection:'sessions'
})
const csrfProtection=csrf();
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, uniqid() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
app.set('view engine','ejs')
app.set('views','views')
const adminRoutes=require('./routes/admin')
const shopRoutes=require('./routes/shop')
const error404=require('./routes/404')
const authRoute=require('./routes/auth')
app.use(bodyParser.urlencoded({ extended:false }))

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use(express.static(path.join(__dirname,'public')))
app.use('/images',express.static(path.join(__dirname,'images')))
app.use(session({
    secret:'sjdfkjsjdiodsnohsoidjniousdhiolksdiucshaionhoihoiaidnqiahdioqwohdoiahsdoiahsdahsjoidhasodjaisnhiudhcoaisnchoiashchjyewf87iuhwe6474y46465454t2yuegd3qwudgy67325e63eg',
    resave:false,
    saveUninitialized:false,
    store:store
}))
app.use(csrfProtection);
app.use(flash());
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
  });
  
  app.use((req, res, next) => {
    if (!req.session.user) {
      return next();
    }
    User.findById(req.session.user._id)
      .then(user => {
        if (!user) {
          return next();
        }
        req.user = user;
        next();
      })
      .catch(err => {
        next(new Error(err));
      });
  });
  


app.use('/admin',adminRoutes)
app.use(shopRoutes)
app.use(authRoute)
app.get('/500',errorController.get500)
app.use(error404)
app.use((error,req, res, next) => {
return res.status(500).render('500', {
      pageTitle: 'Error!',
      path: '/500',
      isAuthenticated: req.session.isLoggedIn
    });
  });
mongoose.connect('mongodb+srv://Kabir:9416285188@cluster0-rsbgg.mongodb.net/shop')
.then(result=>{
    app.listen(3200);
})
.catch(err=>{
    console.log(err)
})