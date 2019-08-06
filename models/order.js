const getDB = require("../util/database").getDB;
const ObjectID = require('mongodb').ObjectID;

module.exports = class Order {

    constructor(data){
        this.order = data.order;
        this.userId = data.userId;       
    }

    saveUserOrder(user){
        const db = getDB();
        return db.collection('orders').insertOne(this).catch(err => {
                console.log(err);
            });
    }

    static async getUserOrder(user){
        return new Promise((resolve, reject) => {
            const db = getDB();
            return db.collection('orders').find({'userId': user._id}).toArray(function (err, data) {
                if(err){
                    return reject(err);
                }else {                    
                    return resolve(data);
                }
            });
        });
    }

    static async getOrder(orderId){
        return new Promise((resolve, reject) => {            
            const db = getDB();
            return db.collection('orders').find({'_id': new ObjectID(orderId)}).toArray(function (err, data) {
                if(err){
                    return reject(err);
                }else {                    
                    return resolve(data);
                }
            });
        });
    }
}