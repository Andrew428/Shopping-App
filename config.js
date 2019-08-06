const DB_USERNAME = '';
const DB_PASSWORD = '';
const DB_NAME = '';
const SESSION_KEY  = '';
const MAILGUN_KEY  = '';
const MAILGUN_DOMAIN  = '';
const PORT = 3000;
const BUCKET_NAME = '';
const IAM_USER_KEY = '';
const IAM_USER_SECRET = '';
const CLOUDFRONT_URL = '';


if(process.env.NODE_ENV === "dev" || !process.env.NODE_ENV){
    const STRIP_SK_KEY = '';
    const STRIP_PK_KEY = '';
    module.exports = {    
        MONGODB_URI : `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@cluster0-gfqrh.mongodb.net/${DB_NAME}`,
        ENV : process.env.NODE_ENV,
        SESSION_KEY : SESSION_KEY,
        MAILGUN_KEY : MAILGUN_KEY,
        MAILGUN_DOMAIN : MAILGUN_DOMAIN ,
        STRIP_SK_KEY: STRIP_SK_KEY,
        STRIP_PK_KEY: STRIP_PK_KEY,
        PORT: PORT,
        BUCKET_NAME: BUCKET_NAME,
        IAM_USER_KEY: IAM_USER_KEY,
        IAM_USER_SECRET: IAM_USER_SECRET,
        CLOUDFRONT_URL: CLOUDFRONT_URL

    };
}else if(process.env.NODE_ENV === "production"){
    const STRIP_SK_KEY = '';
    const STRIP_PK_KEY = '';
    module.exports = {    
        MONGODB_URI : `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@cluster0-gfqrh.mongodb.net/${DB_NAME}`,
        ENV : process.env.NODE_ENV,
        SESSION_KEY : SESSION_KEY,
        MAILGUN_KEY : MAILGUN_KEY,
        MAILGUN_DOMAIN : MAILGUN_DOMAIN ,
        STRIP_SK_KEY: STRIP_SK_KEY,
        STRIP_PK_KEY: STRIP_PK_KEY,
        PORT: process.env.PORT || PORT,
        BUCKET_NAME: BUCKET_NAME,
        IAM_USER_KEY: IAM_USER_KEY,
        IAM_USER_SECRET: IAM_USER_SECRET,
        CLOUDFRONT_URL: CLOUDFRONT_URL
    };
}
