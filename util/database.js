const MongoClient = require('mongodb').MongoClient;

const config = require('../config.js');
const uri = config.MONGODB_URI;

let _db;

const mongoConnect = async (callback) => {   
    const client = new MongoClient(uri, {
        useNewUrlParser: true
    });
    client.connect(err => {
        if (err) {
            var returnObj = {
                "status": false,
                "message": `🛑   ERROR connecting to: ${uri}. ${err}`
            };
            callback(returnObj);
            throw err;
    
        } else {
            returnObj = {
                "status": true,
                "message":`🚀   MongoDB connected to: ${uri}`
            };   
            _db = client.db()         
            callback(returnObj);
        }
    });
    
}

const getDB = () => {
    if(_db){
        return _db
    }
    throw `No Database Found`
}


exports.mongoConnect = mongoConnect;
exports.getDB = getDB;


