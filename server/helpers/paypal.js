const paypal = require("paypal-rest-sdk");
require('dotenv').config();

function validatePayPalConfig() {
    const config = {
        mode: process.env.PAYPAL_MODE || 'sandbox',  // default to sandbox
        clientId: process.env.PAYPAL_CLIENT_ID,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET
    };

    // Validate config
    if (!config.clientId || !config.clientSecret) {
        throw new Error('PayPal credentials missing. Check PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET');
    }

    if (!['sandbox', 'live'].includes(config.mode)) {
        console.warn(`Invalid PAYPAL_MODE "${config.mode}", defaulting to "sandbox"`);
        config.mode = 'sandbox';
    }

    return config;
}

try {
    const config = validatePayPalConfig();
    console.log('Configuring PayPal with mode:', config.mode);
    
    paypal.configure({
        mode: config.mode,
        client_id: config.clientId,
        client_secret: config.clientSecret
    });
} catch (error) {
    console.error('PayPal configuration error:', error.message);
    throw error;
}

module.exports = paypal;
  mode: process.env.PAYPAL_MODE,
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

module.exports = paypal;
