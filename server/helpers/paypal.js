const paypal = require("paypal-rest-sdk");
require('dotenv').config();

// Simple wrapper for PayPal API calls
const PayPalAPI = {
    createPayment: (payment) => {
        return new Promise((resolve, reject) => {
            paypal.payment.create(payment, (error, payment) => {
                if (error) {
                    console.error('[PayPal] Create payment error:', error.response || error);
                    reject(error);
                } else {
                    console.log('[PayPal] Payment created successfully');
                    resolve(payment);
                }
            });
        });
    }
};

// Initialize PayPal configuration
function initPayPal() {
    const config = {
        mode: process.env.PAYPAL_MODE || 'sandbox',
        client_id: process.env.PAYPAL_CLIENT_ID,
        client_secret: process.env.PAYPAL_CLIENT_SECRET
    };

    console.log('[PayPal] Initializing with mode:', config.mode);

    if (!config.client_id || !config.client_secret) {
        throw new Error('PayPal credentials missing. Check PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET');
    }

    if (!['sandbox', 'live'].includes(config.mode)) {
        console.warn(`Invalid PAYPAL_MODE "${config.mode}", defaulting to "sandbox"`);
        config.mode = 'sandbox';
    }

    // Configure PayPal SDK
    paypal.configure(config);
    return PayPalAPI;
}

// Initialize and export
const paypalInstance = initPayPal();
module.exports = paypalInstance;
  mode: process.env.PAYPAL_MODE,
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

module.exports = paypal;
