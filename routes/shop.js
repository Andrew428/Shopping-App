const express = require("express");
const router = express.Router();
const shopController = require("../controllers/shop");
const isAuth = require("../middleware/is-auth");

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', isAuth, shopController.getUserCart);

router.post('/cart', isAuth, shopController.addToUserCart);

router.post('/cart-update', isAuth, shopController.updateUserCart);

router.post('/cart-delete/:productId', isAuth, shopController.deleteUserCart);

router.get('/checkout', isAuth, shopController.getCheckout);

router.get('/orders', isAuth, shopController.getOrders);

router.post('/orders', isAuth, shopController.postOrders);

router.get('/orders/:orderId', isAuth, shopController.getInvoice);

router.get('/orders/:orderId', isAuth, shopController.getInvoice);



exports.routes = router;

