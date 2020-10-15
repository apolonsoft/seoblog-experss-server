const express = require('express');
const router = express.Router();
const {shopifyInstall, shopifyAuthCallback} = require('../controllers/shopify');

router.get('/shopify/install', shopifyInstall);
router.get('/shopify/auth/callback', shopifyAuthCallback);

module.exports = router;
