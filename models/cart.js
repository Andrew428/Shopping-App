const ObjectID = require('mongodb').ObjectID;
const Product = require("../models/product");
const User = require("../models/user");

module.exports = class Cart {    

    static async fetchCart(cart, user){       
             return new Promise((res, rej) => {
                if(cart.length>0){               
                    var count = 0;
                    var totalPrice = 0;               
                    cart.totalPrice = 0;
                    return cart.find((prod, idx) => {                                    
                        Product.fetchProduct(prod._id, idx).then((product) => {                                                
                            if(product[0] && !product[0].disabled && product[0].qty !== 0){                            
                                if(product[0].qty < cart[product.index].qty){
                                    let qtyOrg = cart[product.index].qty;
                                    cart[product.index].qty = product[0].qty;
                                    let p = {
                                        "_id" : new ObjectID(product[0]._id).toString(),
                                        "qty" : cart[product.index].qty
                                    }
                                    User.updateUserCart(p, user);
                                    cart.productUpdated = true;
                                    product[0].productUpdatedMsg = `Qty was updated from ${qtyOrg} to ${cart[product.index].qty} due to protuct limitations`;
                                }                                                   
                                cart[product.index].productDetails = product[0];                                                         
                                if(cart[product.index]){
                                    totalPrice += parseInt(cart[product.index].qty) * parseFloat(product[0].price).toFixed(2);
                                    cart.totalPrice = totalPrice.toFixed(2);
                                }
                                count++;
                                if(count === cart.length || cart.length  === 0){
                                    console.log("Returned Cart", cart);
                                    return res(cart);                             
                                }
                            }else{                               
                                let p = {}
                                p.productId= new ObjectID(product[0]._id).toString();                                                               
                                User.deleteUserCart(p, user);
                                cart.cartUpdated = true;
                                if(count === cart.length){ 
                                    console.log("Returned Cart", cart); 
                                    if(cart.length === 0){
                                        cart = [];
                                        cart.cartUpdated = true;
                                    }                                                                                           
                                    return res(cart);
                                }
                            }
                        
                        }).catch (err =>{                                                    
                            return rej(err);                               
                        });
                    });
                }else{
                    cart = [];
                    return res(cart);
                }
            });
        
    }
    
}