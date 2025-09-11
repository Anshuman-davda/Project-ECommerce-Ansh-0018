const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

// Configure PayPal environment
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID || 'sb';
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || 'sb';
  
  return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
}

function client() {
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

module.exports = { client };
