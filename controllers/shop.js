const fs = require('fs');
const path = require('path');
const PDFDoc = require('pdfkit');
const Product = require("../models/product");
const Cart = require("../models/cart");
const User = require("../models/user");
const config = require('../config.js');
const Order = require("../models/order");
const ObjectID = require('mongodb').ObjectID;
const stripe = require('stripe')(config.STRIP_SK_KEY);

const ITEMS_PER_PAGE = 3

const ObjectId = require('mongodb').ObjectID;

exports.getProducts  = async (req, res, next)=>{    
    let page = parseInt(req.query.page);
    if(!page){
        page = 1;
    }
    
    let productCount = await Product.fetchProductCountAvailable().catch(err => {        
        res.redirect("/500");
    });
    let products = await Product.fetchPage(page, ITEMS_PER_PAGE).catch(err => {        
        res.redirect("/500");
    });
      
    const renderData = {
        "pageTitle": "Products",
        "products": products,  
        "path": '/products/', 
        "userData" : {
            isLoggedIn : req.session.isLoggedIn,
            isAdmin : req.session.isAdmin   
        },
        "pageDetails": {
            "currentPage": page,
            "productCount": productCount,
            "hasNextPage": page * ITEMS_PER_PAGE < productCount,
            "hasPreviousPage": page > 1,
            "nextPage" : page+1,
            "previousPage" : page -1,
            "lastPage" : Math.ceil(productCount / ITEMS_PER_PAGE)   
        }   
        
    }
    res.render('shop/product-list',renderData)
    
}

exports.getProduct  = async (req, res, next)=>{      
    const prodId = req.params.productId;
    Product.fetchProduct(prodId).then(product => {
        const renderData = {
            "pageTitle": "Products",
            "product": product[0],  
            "path": `/products`,
            "userData" : {
                isLoggedIn : req.session.isLoggedIn,
                isAdmin : req.session.isAdmin   
            } 
        }
        res.render('shop/product-detail',renderData)
    }).catch(err =>{        
        res.redirect("/500");
    }) 
}

exports.getIndex  = async (req, res, next)=>{ 
    let page = parseInt(req.query.page);
    if(!page){
        page = 1;
    }
    let productCount = await Product.fetchProductCountAvailable().catch(err => {        
        res.redirect("/500");
    });
    let products = await Product.fetchPage(page, ITEMS_PER_PAGE).catch(err => {        
        res.redirect("/500");
    });
    const renderData = {
        "pageTitle": "Shop", 
        "products": products,  
        "path": '/', 
        "userData" : {
            "isLoggedIn" : req.session.isLoggedIn,
            "isAdmin" : req.session.isAdmin   
        },
        "pageDetails": {
            "currentPage": page,
            "productCount": productCount,
            "hasNextPage": page * ITEMS_PER_PAGE < productCount,
            "hasPreviousPage": page > 1,
            "nextPage" : page+1,
            "previousPage" : page -1,
            "lastPage" : Math.ceil(productCount / ITEMS_PER_PAGE)   
        }   
    }
    res.render('shop/index',renderData)
    
    
    
}

exports.getUserCart  = async (req, res, next)=>{  
    const cart = req.user.cart;    
    Cart.fetchCart(cart, req.user).then(cartDetails => {
        const renderData = {
            "pageTitle": "Cart",
            "cart": cartDetails,  
            "path": '/cart', 
            "userData" : {
                isLoggedIn : req.session.isLoggedIn,
                isAdmin : req.session.isAdmin   
            } 
        }
        res.render('shop/cart',renderData)
    }).catch(async err => {        
        await User.clearUserCart(req.user);               
        res.redirect("shop/cart");
    });   
}

exports.addToUserCart = async (req, res, next)=>{ 
    const postData = {
        _id : req.body.productId,
        qty : req.body.qty,
    }           
    User.addToCart(postData, req.user).then(cart => {   
        Cart.fetchCart(cart, req.user).then(cartDetails => { 
            const renderData = {
                "pageTitle": "Cart", 
                "cart": cartDetails, 
                "path": '/cart', 
                "userData" : {
                    isLoggedIn : req.session.isLoggedIn,
                    isAdmin : req.session.isAdmin   
                }
            }
            res.render('shop/cart',renderData);
        }).catch(err =>{            
            res.redirect("/500");
        })
    }).catch(err =>{        
        res.redirect("/500");
    })
    
}

exports.updateUserCart  = async (req, res, next)=>{ 
    const postData = {
        productId : req.body.productId,
        orderQty : req.body.orderQty,
        productQty : req.body.productQty,
    }    
    await User.updateUserCart(postData, req.user);
    res.redirect("/cart");
}

exports.deleteUserCart  = async (req, res, next)=>{ 
    const postData = {
        productId : req.params.productId
    }    
    await User.deleteUserCart(postData, req.user);
    res.redirect("/cart");
}

exports.getCheckout = async (req, res, next)=>{
    const cart = req.user.cart;    
    Cart.fetchCart(cart, req.user).then(cartDetails => {
        if(cartDetails.cartUpdated || cartDetails.productUpdated){       
            const renderData = {
                "pageTitle": "Cart",
                "cart": cartDetails,  
                "path": '/cart', 
                "userData" : {
                    isLoggedIn : req.session.isLoggedIn,
                    isAdmin : req.session.isAdmin   
                },

            }           
            res.render('shop/cart',renderData)
        }else{
            const renderData = {
                "pageTitle": "Checkout",
                "cart": cartDetails,  
                "path": '/checkout', 
                "userData" : {
                    isLoggedIn : req.session.isLoggedIn,
                    isAdmin : req.session.isAdmin   
                }, 
                "strip_pk": config.STRIP_PK_KEY,
            }
            res.render('shop/checkout',renderData)
        }
    }).catch(err => {        
        res.redirect("/500");
    })
}

exports.postCheckout = async (req, res, next)=>{    
    const token = req.body.stripeToken;    
    const cart = req.user.cart;    
    Cart.fetchCart(cart, req.user).then(cartDetails => {
        if(cartDetails.cartUpdated || cartDetails.productUpdated){        
            const renderData = {
                "pageTitle": "Cart",
                "cart": cartDetails,  
                "path": '/cart', 
                "userData" : {
                    isLoggedIn : req.session.isLoggedIn,
                    isAdmin : req.session.isAdmin   
                },                
            }           
            res.render('shop/cart',renderData)
        }else{
            var orderData = {
                "order": cartDetails,
                "userId" : req.user._id
            } 
            const order = new Order(orderData);    
            order.saveUserOrder(req.user).then(async() => { 
                let orders =  await Order.getUserOrder(req.user).catch(err => {
                    console.log(err);
                    res.redirect("/500");
                });
                let invoiceId = ObjectID(orders[orders.length-1]._id).toString();
                
                let amount = parseInt(parseFloat(cartDetails.totalPrice).toFixed(2) * 100);
                await stripe.charges.create({
                    amount: amount,
                    currency: 'usd',
                    description: `Invoice number: ${invoiceId}`,
                    source: token,
                    metadata: { order_id: invoiceId}
                }).catch(err => {
                    console.log(err);
                    res.redirect("/500");                    
                });
                 

                var count = 0;           
                cartDetails.find(item => {
                    var product = {
                        "_id" : item._id,
                        "qty" : (item.productDetails.qty - item.qty)
                    }
                    Product.updateProduct(product).then(() => {
                        User.clearUserCart(req.user).then(() => {
                            count++;
                            if(count === cartDetails.length){                                                    
                                res.redirect('/orders');
                            }                                                       
                        }).catch(err => {
                            console.log(err);
                            res.redirect("/500");                            
                        }); 
                    }).catch(err => {
                        console.log(err);   
                        res.redirect("/500");                     
                    }); 
                });           
            }).catch(err => {
                console.log(err);
                res.redirect("/500");                
            });
        }
    }).catch(err => {        
        res.redirect("/500");
    })
}

exports.getOrders = async (req, res, next)=>{
    const orders = await Order.getUserOrder(req.user);
    const renderData = {
        "pageTitle": "Orders",
        "orders": orders,  
        "path": '/orders', 
        "userData" : {
            isLoggedIn : req.session.isLoggedIn,
            isAdmin : req.session.isAdmin   
        }
    }
    res.render('shop/orders',renderData)
}

// postOrders depreciated
exports.postOrders = async (req, res, next)=>{    
    const cart = req.user.cart;    
    Cart.fetchCart(cart, req.user).then(cartDetails => {
        if(cartDetails.cartUpdated || cartDetails.productUpdated){       
            const renderData = {
                "pageTitle": "Cart",
                "cart": cartDetails,  
                "path": '/cart', 
                "userData" : {
                    isLoggedIn : req.session.isLoggedIn,
                    isAdmin : req.session.isAdmin   
                },

            }           
            res.render('shop/cart',renderData)
        }else{
            var orderData = {
                "order": cartDetails,
                "userId" : req.user._id
            } 
            const order = new Order(orderData);    
            order.saveUserOrder(req.user).then(() => { 
                var count = 0;           
                cartDetails.find(item => {
                    var product = {
                        "_id" : item._id,
                        "qty" : (item.productDetails.qty - item.qty)
                    }
                    Product.updateProduct(product).then(() => {
                        User.clearUserCart(req.user).then(() => {
                            count++;
                            if(count === cartDetails.length){                                                    
                                res.redirect('/orders');
                            }                                                       
                        }).catch(err => {
                            console.log(err);
                            res.redirect("/500");                            
                        }); 
                    }).catch(err => {
                        console.log(err); 
                        res.redirect("/500");                       
                    }); 
                });           
            }).catch(err => {
                console.log(err);                
            })
        }
    }).catch(err => {        
        res.redirect("/500");
    })
    
}

exports.getInvoice = async (req, res, next)=>{
    const orderId = req.params.orderId;
    const order = await Order.getOrder(orderId);
    const orderData = order[0].order;   
    if(ObjectId(req.session.user._id).toString() === ObjectId(order[0].userId.id).toString()){
        const invoiceName = 'Invoice-' + orderId + '.pdf';
        const pdfDoc = new PDFDoc();
        res.setHeader('Content-Type', 'appication/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="'+invoiceName+'"');
        pdfDoc.pipe(res);
        
        pdfDoc.fontSize(20).text("Invoice - " + orderId);
        pdfDoc.fontSize(20).text("___________________________________");
        var total = 0; 
        for(var x = 0; x <orderData.length; x++){
            pdfDoc.fontSize(20).text("");
            pdfDoc.fontSize(15).text("Title: " + orderData[x].productDetails.title);
            pdfDoc.fontSize(15).text("Oty: " + orderData[x].qty);
            pdfDoc.fontSize(15).text("Unit Price: $" + orderData[x].productDetails.price);
            pdfDoc.fontSize(15).text("Product Total: $" + (parseFloat(orderData[x].productDetails.price).toFixed(2) * parseInt(orderData[x].qty)));
            pdfDoc.fontSize(20).text("___________________________________");
            total = total + parseFloat(orderData[x].productDetails.price).toFixed(2) * parseInt(orderData[x].qty);
            
        }
        pdfDoc.fontSize(20).text("");
        pdfDoc.fontSize(18).text("Total: $" + total);
        pdfDoc.fontSize(20).text("Thank you for your order!"); 

        pdfDoc.end();

        /// Read File
        // fs.readFile(invoicePath, (err, data) => {
        //     if(err){
        //     return next(err);
        //     }
        //     res.setHeader('Content-Type', 'appication/pdf');
        //     res.setHeader('Content-Disposition', 'attachment; filename="'+invoiceName+'"');
        //     res.send(data);
        // });

        /// Stream File
        // const file = fs.createReadStream(invoicePath);
        // res.setHeader('Content-Type', 'appication/pdf');
        // res.setHeader('Content-Disposition', 'attachment; filename="'+invoiceName+'"');
        // file.pipe(res);

    }else{
        res.redirect("/500");
    }
}