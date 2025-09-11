const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

// Configure PayPal environment
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  
  // If no PayPal credentials are provided, return null to use demo mode
  if (!clientId || !clientSecret || clientId === 'sb' || clientSecret === 'sb') {
    return null;
  }
  
  return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
}

function client() {
  const env = environment();
  if (!env) {
    return null; // Return null if no valid PayPal credentials
  }
  return new checkoutNodeJssdk.core.PayPalHttpClient(env);
}

module.exports = { client };