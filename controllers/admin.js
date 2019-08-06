const fs = require('fs');
const adminData = require("../routes/admin");
const Product = require("../models/product");
const config = require("../config");

const ITEMS_PER_PAGE = 3

const {
    validationResult
} = require("express-validator/check");

const _checkUrl = (src) => {
    const arr = [ "jpeg", "jpg", "gif", "png" ];
    const ext = src.substring(src.lastIndexOf(".")+1);
    const test = arr.indexOf(ext) === -1 ?  false : true;  
    return test;
  
 }

const _deleteFile = (filePath) =>{
     fs.unlink(filePath, (err) =>{
         if(err){
            res.redirect("/500");
         }
     })
 }


exports.getAdminProducts = async (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    let page = parseInt(req.query.page);
    if(!page){
        page = 1;
    }   
    let products = await Product.fetchAll().catch(err => {       
        res.redirect("/500");
    });  
    const renderData = {
        "pageTitle": "Admin Products",
        "products": products,
        "path": '/admin/products/',
        "userData": {
            isLoggedIn: req.session.isLoggedIn,
            isAdmin: req.session.isAdmin
        },         
    }
    res.render('admin/products', renderData)
   
}

exports.getAddProduct = (req, res, next) => {
    const product = {
        "title": "",
        "image": "",
        "price": "",
        "qty": "0",
        "description": ""
    }
    const error = {
        "errorTitle": "",
        "errorImage": "",
        "errorPrice": "",
        "errorQty": "",
    }
    const renderData = {
        "pageTitle": "Admin Add Product",
        "path": "/admin/add-product",
        "mode": "add",
        "product": product,
        "userData": {
            isLoggedIn: req.session.isLoggedIn,
            isAdmin: req.session.isAdmin
        },
        "successMsg": req.flash("successMsg"),
        "error": error,
    }
    res.render('admin/edit-product', renderData)
}

exports.postAddProduct = (req, res, next) => {
    const data = req.body;
    const image = req.files[0]; 
    
    const errors = validationResult(req);

    const productData = {
        "title": data.title,      
        "price": data.price,
        "qty": parseInt(data.qty),
        "description": data.description,
        "disabled": false,
        "userId": req.user._id
    }
    
    if(image){        
        const originalname = req.files[0].originalname;
        const imagePath = config.CLOUDFRONT_URL + originalname; 
        productData.image = imagePath;
    } 
    const error = {
        "errorTitle": "",
        "errorImage": "",
        "errorPrice": "",
        "errorQty": "",
    }

    const renderData = {
        "pageTitle": "Admin Add Product",
        "path": "/admin/add-product",
        "mode": "add",
        "product": productData,
        "userData": {
            isLoggedIn: req.session.isLoggedIn,
            isAdmin: req.session.isAdmin
        },
        "error": error,
    }     

    if (!errors.isEmpty()) {
        let errorArray = errors.array();
        for (var x = 0; x < errorArray.length; x++) {
            switch (errorArray[x].param) {
                case "title":
                    renderData.error.errorTitle = errorArray[x].msg;
                    break;
                case "price":
                    renderData.error.errorPrice = errorArray[x].msg;
                    break;
                case "qty":
                    renderData.error.errorQty = errorArray[x].msg;
                    break;
                default:
                    //none
            }
        }        
        return res.status(422).render('admin/edit-product', renderData);
    }

    const product = new Product(productData);
    product.saveProduct().then(() => {
        res.redirect("/admin/products");
    }).catch(err => {      
        res.redirect("/500");
    })


}

exports.getEditProduct = async (req, res, next) => {
    const product = await Product.fetchProduct(req.params.productId);
    const error = {
        "errorTitle": "",
        "errorImage": "",
        "errorPrice": "",
        "errorQty": "",
    }
    const renderData = {
        "pageTitle": "Admin Edit Product",
        "path": "/admin/edit-product",
        "mode": "edit",
        "product": product[0],
        "userData": {
            isLoggedIn: req.session.isLoggedIn,
            isAdmin: req.session.isAdmin
        },
        "successMsg": req.flash("successMsg"),
        "error": error
    }
    res.render('admin/edit-product', renderData)
}

exports.postEditProduct = async (req, res, next) => {
    const prodId = req.params.productId;
    const data = req.body;
    const image = req.files[0];   

    const errors = validationResult(req);   

    const updatedData = {
        "title": data.title,        
        "price": data.price,
        "qty": data.qty,
        "description": data.description,
        "_id": prodId
    }
    
    if(image){  
        const originalname = req.files[0].originalname;
        const imagePath = config.CLOUDFRONT_URL + originalname; 
        updatedData.image = imagePath;
    }else{
        updatedData.image = data.imagePath;
    }
    
    const error = {
        "errorTitle": "",
        "errorImage": "",
        "errorPrice": "",
        "errorQty": "",
    }

    const renderData = {
        "pageTitle": "Admin Edit Product",
        "path": "/admin/edit-product",
        "mode": "edit",
        "product": updatedData,
        "userData": {
            isLoggedIn: req.session.isLoggedIn,
            isAdmin: req.session.isAdmin
        },
        "error": error,
    }

    

    if (!errors.isEmpty()) {
        let errorArray = errors.array();
        for (var x = 0; x < errorArray.length; x++) {
            switch (errorArray[x].param) {
                case "title":
                    renderData.error.errorTitle = errorArray[x].msg;
                    break;                    
                case "price":
                    renderData.error.errorPrice = errorArray[x].msg;
                    break;
                case "qty":
                    renderData.error.errorQty = errorArray[x].msg;
                    break;
                default:
                    //none
            }
        } 
              
        return res.status(422).render('admin/edit-product', renderData);
    }
    await Product.updateProduct(updatedData);
    res.redirect("/admin/products");  
}

exports.postDisableProduct = async (req, res, next) => {
    const prodId = req.params.productId;
    const updatedData = {
        "disabled": true,
        "_id": prodId
    }
    await Product.updateProduct(updatedData);
    res.redirect("/admin/products");
}

exports.postEnableProduct = async (req, res, next) => {
    const prodId = req.params.productId;
    const updatedData = {
        "disabled": false,
        "_id": prodId
    }
    await Product.updateProduct(updatedData);
    res.redirect("/admin/products");
}

exports.deleteProduct = async (req, res, next) => {
    const prodId = req.params.productId;    
    const product = await Product.fetchProduct(prodId);   
    Product.deleteProduct(prodId).then(() =>{        
        res.status(200).json({message:"Success!"});
    }).catch(err => {
        res.status(500).json({message:"Failed!"});
    });    
}