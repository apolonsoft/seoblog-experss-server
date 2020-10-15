const apiKey = process.env.SHOPIFY_API_KEY
const shop = process.env.SHOPIFY_SHOP_NAME
const scopes = 'read_products'
const forwardingAddress = process.env.NGROK_FORWARDING_ADDRESS
const nonce = require('nonce')()
const cookie = require('cookie')
const queryString = require('query-string')
const apiSecret = process.env.SHOPIFY_API_SECRET_KEY
const crypto = require('crypto')
const axios = require('axios')

exports.shopifyInstall = (req, res) => {
    const state = nonce()
    const redirectUri = forwardingAddress + 'api/shopify/auth/callback'
    const installUrl = 'https://' + shop
        + '/admin/oauth/authorize?client_id=' + apiKey
        + '&scope=' + scopes
        + '&state=' + state
        + '&redirect_uri=' + redirectUri
    res.cookie('state', state)
    res.redirect(installUrl)
}

exports.shopifyAuthCallback = (req, res) => {
    const {shop, hmac, code, state} = req.query
    const stateCookie = cookie.parse(req.headers.cookie).state

    if (state !== stateCookie) {
        return res.status(403).send('Request origin cannot be verified')
    }

    if (shop && hmac && code) {
        const map = Object.assign({}, req.query)
        delete map['signature']
        delete map['hmac']
        const message = queryString.stringify(map)
        const providedHmac = Buffer.from(hmac, 'utf-8')
        const generatedHash = Buffer.from(
            crypto.createHmac('sha256', apiSecret)
                .update(message)
                .digest('hex'),
            'utf-8'
        )
        let hashEquals = false

        try {
            hashEquals = crypto.timingSafeEqual(generatedHash, providedHmac)
        } catch (e) {
            hashEquals = false
        }

        if (!hashEquals) {
            return res.status(400).send('HMAC validation failed')
        }
        const accessTokenRequestUrl = 'https://' + shop + '/admin/oauth/access_token'
        const accessTokenPayload = {
            client_id: apiKey,
            client_secret: apiSecret,
            code,
        }

        axios({
            method: 'post',
            url: accessTokenRequestUrl,
            data: accessTokenPayload
        }).then(accessTokenResponse => {
            const accessToken = accessTokenResponse.data.access_token
            const shopRequestUrl = 'https://' + shop + '/admin/api/2020-10/products.json'
            const shopRequestHeaders = {
                'X-Shopify-Access-Token': accessToken,
            }

            axios({
                method: 'get',
                url: shopRequestUrl,
                headers: shopRequestHeaders
            }).then(shopResponse => {
                res.json(shopResponse.data)
            }).catch((error) => {
                res.status(error.statusCode).send(error.error)
            })
        }).catch(error => {
            res.status(error.statusCode).send(error.error)
        })
    } else {
        res.status(400).send('Required parameters missing')
    }
}
