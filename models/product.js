
const getDB = require("../util/database").getDB;
var ObjectID = require('mongodb').ObjectID;



module.exports = class Product {
    constructor(data) {
        this.title = data.title;         
        this.image = data.image;       
        this.price = data.price;
        this.qty = parseInt(data.qty);
        this.description = data.description;
        this.disabled = data.disabled;
        this.userId = data.userId ? data.userId : null;
    }

    saveProduct() {
        const db = getDB();
        return db.collection('products')
            .insertOne(this)
            .then(result => {
                console.log(`✅  Product saved`);
            })
            .catch(err => {
                console.log(`❌  Product saved`);                        
            })
    }

    static async fetchAll () {            
        return new Promise((resolve, reject) => {
            const db = getDB();
            db.collection('products').find({}).toArray(function (err, data) {
                if(err){
                    return reject(err);
                }else {
                    return resolve(data);
                }
            });
        }).catch(err=>{
            console.log(`❌  Error fetching all products`); 
        });
    }

    static async fetchProductCountAvailable() {            
        return new Promise((resolve, reject) => {
            const db = getDB();
            db.collection('products').find({ $and: [ { qty: { $ne: 0 } }, { disabled: { $ne: true } } ]}).toArray(function (err, data) {
                if(err){
                    return reject(err);
                }else {
                    return resolve(data.length);
                }
            });
        }).catch(err=>{
            console.log(`❌  Error fetching product count avalible`);          
        });
    }

    static async fetchProductCountTotal () {            
        return new Promise((resolve, reject) => {
            const db = getDB();
            db.collection('products').find({}).toArray(function (err, data) {
                if(err){
                    return reject(err);
                }else {
                    return resolve(data.length);
                }
            });
        }).catch(err=>{
            console.log(`❌  Error fetching product count total`);            
        });
    }

    static async fetchPage (page, ITEMS_PER_PAGE) {              
        return new Promise((resolve, reject) => {
            const db = getDB();
            db.collection('products').find({ $and: [ { qty: { $ne: 0 } }, { disabled: { $ne: true } } ]}).skip((page -1)*ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE).toArray(function (err, data) {
                if(err){
                    return reject(err);
                }else {
                    return resolve(data);
                }
            });
        }).catch(err=>{
            console.log(`❌  Error fetching page`);  
            
        });
    }

    static async fetchPageAdmin (page, ITEMS_PER_PAGE) {
        if(!page){
            page = 1;            
        }
        if(!ITEMS_PER_PAGE){
            ITEMS_PER_PAGE = 2;            
        }       
        return new Promise((resolve, reject) => {
            const db = getDB();
            db.collection('products').find({}).skip((page -1)*ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE).toArray(function (err, data) {
                if(err){
                    return reject(err);
                }else {
                    return resolve(data);
                }
            });
        }).catch(err=>{
            console.log(`❌  Error fetching admin page`);
        });
    }

    static async fetchProduct (_id, i) {
        return new Promise((resolve, reject) => {
            const db = getDB();
            db.collection('products').find({"_id": new ObjectID(_id)}).toArray(function (err, data) {
                if(err){
                    return reject(err);
                }else {                    
                    data.index = i;                    
                    return resolve(data);
                }
            });
        }).catch(err => {
            console.log(`❌  Error fetching Product`);                 
        });
    }

    static async updateProduct (product) {
        return new Promise((resolve, reject) => { 
            var updateId = {"_id": new ObjectID(product._id)};
            var updateData = {};
            if  (product.title !== undefined) {
                updateData.title = product.title;
            }             
            if  (product.image !== undefined) {
                updateData.image = product.image;
            }
            if  (product.price !== undefined) {
                updateData.price = product.price;
            }
            if  (product.qty !== undefined) {
                updateData.qty = parseInt(product.qty);
            }
            if  (product.description !== undefined) {
                updateData.description = product.description;
            }
            if  (product.disabled !== undefined) {
                updateData.disabled = product.disabled;
            }
            const db = getDB();            
            db.collection('products').updateOne(
                updateId, 
                {$set:updateData },  
                (err, data) => {
                    if(err){
                        return reject(`Updated Err: product - ${product} | error - ${err}`);
                    }else {
                        return resolve(`Updated: ${product}`);
                    }
                });
        }).catch(err=>{            
            console.log(`❌  ERROR Updating Product: ${err}`);
        });
    }

    static async deleteProduct (productId) {        
        return new Promise((resolve, reject) => {
            const db = getDB();
            db.collection('products').deleteOne( { "_id" : new ObjectID(productId) }).then(result =>{
                return resolve(`Updated: ${result}`);
            });
        }).catch(err=>{
            console.log(`❌  ERROR Deleting Product: ${err}`);            
        });
    }
}