
const bodyParser = require('body-parser');
const express = require("express");
const helmet = require('helmet');
const path = require("path"); 
const fs = require("fs"); 
const csrf = require("csurf");
const flash = require("connect-flash");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const compression = require('compression');
const morgan = require('morgan');

const config = require('./config.js');

const rootDir = require("./util/path");
const mongoConnect = require("./util/database").mongoConnect;
const { uploadImage } = require('./util/upload');

const errorController = require("./controllers/error");
const shopController = require("./controllers/shop");

const isAuth = require("./middleware/is-auth");

const User = require("./models/user"); 

console.log(`Starting up ${config.ENV} server on port ${config.PORT}` )

const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'), 
    { flags: 'a' }
);

const app = express();
app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream : accessLogStream }));

app.set('view engine', 'ejs');
app.set('views', 'views');

const store = new MongoDBStore({ 
    uri : config.MONGODB_URI,
    collection: 'sessions'
});

app.use(bodyParser.urlencoded({extended: false})); 
app.use(uploadImage.array('image', 1));
app.use(express.static(path.join(rootDir, 'public')));
app.use('/public/img/product-images', express.static(path.join(rootDir, 'public/img/product-images')));
app.use(session({
    secret: config.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    store: store
}))

app.use(flash());

app.use((req,res, next) => {
    if(!req.session.user){
        return next();
    }
    User.fetchUser(req.session.user._id)
        .then(user => {
            if(!user){
                return next();
            }
            console.log(`👥 `, user[0]);
            req.user = user[0];            
            next();
        }).catch(err => {                        
            res.redirect("/500");           
        });
});


//Routes
const authData = require('./routes/auth');
const adminData = require('./routes/admin');
const shopData = require('./routes/shop');

app.post('/checkout', isAuth, shopController.postCheckout);
const csrfProtection = csrf();
app.use(csrfProtection);
app.use((req,res, next) => { 
    res.locals.csrfToken = req.csrfToken();
    next();
});
app.use('/admin', adminData.routes);
app.use(shopData.routes);
app.use(authData.routes);

app.get('/500', errorController.get500)
app.use(errorController.get404);

mongoConnect((res) => {   
    console.log(res.message);
    app.listen(config.PORT || 3000);
});

