'use strict';

const paypal = require('paypal-rest-sdk');
require('dotenv').config();

// Configure PayPal
const mode = process.env.PAYPAL_MODE || 'sandbox';
console.log('[PayPal] Configuring with mode:', mode);

paypal.configure({
    mode,
    client_id: process.env.PAYPAL_CLIENT_ID,
    client_secret: process.env.PAYPAL_CLIENT_SECRET
});

// Create PayPal payment
const createPayment = (paymentData) => {
    return new Promise((resolve, reject) => {
        paypal.payment.create(paymentData, (error, payment) => {
            if (error) {
                console.error('[PayPal] Payment creation error:', error.message);
                reject(error);
            } else {
                console.log('[PayPal] Payment created successfully:', payment.id);
                resolve(payment);
            }
        });
    });
};

// Exports
module.exports = {
    createPayment,
    paypal
};


module.exports = paypal;
