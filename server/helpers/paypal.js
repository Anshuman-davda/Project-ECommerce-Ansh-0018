// ...existing code...
const paypal = require("paypal-rest-sdk");
require('dotenv').config();

// Log all PayPal env variables for debugging
console.log('[PayPal Config] PAYPAL_MODE:', process.env.PAYPAL_MODE);
console.log('[PayPal Config] PAYPAL_CLIENT_ID:', process.env.PAYPAL_CLIENT_ID ? '[set]' : '[missing]');
console.log('[PayPal Config] PAYPAL_CLIENT_SECRET:', process.env.PAYPAL_CLIENT_SECRET ? '[set]' : '[missing]');

if (!process.env.PAYPAL_MODE || !process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
  console.error('[PayPal Config] Missing required PayPal environment variables.');
  throw new Error('Missing required PayPal environment variables.');
}

if (!["sandbox", "live"].includes(process.env.PAYPAL_MODE)) {
  console.error('[PayPal Config] PAYPAL_MODE must be "sandbox" or "live".');
  throw new Error('PAYPAL_MODE must be "sandbox" or "live".');
}

paypal.configure({
  mode: process.env.PAYPAL_MODE,
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

module.exports = paypal;
