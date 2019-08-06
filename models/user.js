const getDB = require("../util/database").getDB;
var ObjectID = require('mongodb').ObjectID;

module.exports = class User {
    constructor(data){
        this.username = data.username,
        this.email = data.email,
        this.password = data.password.trim(),
        this.cart = data.cart     
    }

    saveUser(){
        const db = getDB();
        return db.collection('users')
            .insertOne(this)
            .then(result => {
                console.log(`✅  User saved`);
            }).catch(err => {                
                console.log(`❌  Error saving user`);  
            })
    }

    static async addToCart(product, user){
        const db = getDB();
        return new Promise((resolve, reject) => { 
            var updateId = {"_id": new ObjectID(user._id)};
            var updateData = {};
            var cart = [];
            if(user.cart){
                cart = user.cart;
            }
            const existingProduct = cart.find(prod =>  prod._id === product._id);
            let updatedProduct;
            if(existingProduct){                
                updatedProduct = existingProduct;
                if((parseInt(updatedProduct.qty) + 1) <= parseInt(product.qty)){
                    updatedProduct.qty = parseInt(updatedProduct.qty) + 1;
                }
            } else {
                updatedProduct = {_id : product._id, qty : 1 };
                cart.push(updatedProduct);
            }         
            user.cart = cart
            updateData.cart = cart;                       
            db.collection('users').updateOne(
                updateId, 
                {$set:updateData },  
                (err, data) => {
                    if(err){
                        return reject(`Updated Err: cart item - ${product} | error - ${err}`);
                    }else {
                        return resolve(cart);
                    }
                });
        }).catch(err=>{
            console.log(`❌  Error adding to cart`); 
        });
    }

    static async updateUserCart(product, user){
        const db = getDB();
        return new Promise((resolve, reject) => { 
            var updateId = {"_id": new ObjectID(user._id)};
            var updateData = {};
            var cart = user.cart;
            cart.find((prod, idx) => {
                if(prod._id === product.productId){
                    if(parseInt(product.orderQty) <= parseInt(product.productQty)){                       
                        cart[idx].qty = parseInt(product.orderQty);
                    }
                }
            });            
            updateData.cart = cart;                       
            db.collection('users').updateOne(
                updateId, 
                {$set:updateData },  
                (err, data) => {
                    if(err){
                        return reject(`Updated Err: cart item - ${product} | error - ${err}`);
                    }else {
                        return resolve(cart);
                    }
                });
        }).catch(err=>{
            console.log(`❌  Error updating user cart`); 
        });
    }

    static async deleteUserCart(product, user){
        const db = getDB();
        return new Promise((resolve, reject) => { 
            var updateId = {"_id": new ObjectID(user._id)};
            var updateData = {};
            var cart = user.cart;
            var index;
            cart.find((prod, idx) => {
                if(prod._id === product.productId){                    
                    index = idx;
                }
            });  
            cart.splice(index, 1);          
            updateData.cart = cart;                       
            db.collection('users').updateOne(
                updateId, 
                {$set:updateData },  
                (err, data) => {
                    if(err){
                        return reject(`Updated Err: cart item - ${product} | error - ${err}`);
                    }else {
                        return resolve(cart);
                    }
                });
        }).catch(err=>{
            console.log(`❌  Error deleting product from user cart`); 
        });
    }

    static async clearUserCart(user){
        const db = getDB();
        return new Promise((resolve, reject) => { 
            var updateId = {"_id": new ObjectID(user._id)};
            var updateData = {};
            user.cart = [];
            var cart = user.cart;                     
            updateData.cart = cart;                       
            db.collection('users').updateOne(
                updateId, 
                {$set:updateData },  
                (err, data) => {
                    if(err){
                        return reject(`Updated Err: cart item - ${product} | error - ${err}`);
                    }else {
                        return resolve(cart);
                    }
                });
        }).catch(err=>{
            console.log(`❌  Error clearing user cart`); 
        });
    }

    static async fetchUser (_id) {
        return new Promise((resolve, reject) => {
            const db = getDB();
            db.collection('users').find({"_id": new ObjectID(_id)}).toArray(function (err, data) {
                if(err){
                    return reject(err);
                }else {
                    return resolve(data);
                }
            });
        }).catch(err=>{
            console.log(`❌  fetching user`); 
        });
    }

    static async findUser (filter) {
        return new Promise((resolve, reject) => {
            const db = getDB();
            db.collection('users').find(filter).toArray(function (err, data) {
                if(err){
                    return reject(err);
                }else {
                    return resolve(data);
                }
            });
        }).catch(err=>{
            console.log(`❌  Error finding user`); 
        });
    }

    static async updateUser (userid, updateData) {
        return new Promise((resolve, reject) => {
            const db = getDB();
            var updateId = {"_id": new ObjectID(userid)};                                            
            db.collection('users').updateOne(
                updateId, 
                {$set:updateData },  
                (err, data) => {
                    if(err){
                        return reject(`Updated Err`);
                    }else {
                        return resolve();
                    }
                });
        }).catch(err=>{
            console.log(`❌  Error updating user`); 
        });
    }



}