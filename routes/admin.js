const express = require("express");
const { check } = require("express-validator/check");
const router = express.Router();
const adminController = require("../controllers/admin");
const isAdmin = require("../middleware/is-admin");
const isAuth = require("../middleware/is-auth");

router.get('/add-product', isAuth, isAdmin, adminController.getAddProduct);

router.post('/add-product',  
    check('title')
        .isLength({ min: 3 }).withMessage('Title must be at least 3 chars long'),    
    check('price')
        .matches(/(\d+\.\d{1,2})/).withMessage('Must be a valid price'),
    check('qty')
        .matches(/\d/).withMessage('Must be a valid number'),
    isAuth, 
    isAdmin, 
    adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth, isAdmin, adminController.getEditProduct);

router.post('/edit-product/:productId',  
    check('title')
        .isLength({ min: 3 }).withMessage('Title must be at least 3 chars long'),    
    check('price')
        .matches(/(\d+\.\d{1,2})/).withMessage('Must be a valid price'),
    check('qty')
        .matches(/\d/).withMessage('Must be a valid number'),    
    isAuth, 
    isAdmin,
    adminController.postEditProduct);

router.post('/disable-product/:productId',  isAuth, isAdmin, adminController.postDisableProduct);

router.post('/enable-product/:productId',  isAuth, isAdmin, adminController.postEnableProduct);

router.delete('/product/:productId',  isAuth, isAdmin, adminController.deleteProduct);

router.get('/products',  isAuth, isAdmin, adminController.getAdminProducts);

exports.routes = router;



