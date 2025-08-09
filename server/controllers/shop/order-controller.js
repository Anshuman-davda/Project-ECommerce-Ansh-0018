const paypal = require("../../helpers/paypal");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const createPayPalPayment = (paymentJson) => {
  return new Promise((resolve, reject) => {
    paypal.payment.create(paymentJson, (error, payment) => {
      if (error) reject(error);
      else resolve(payment);
    });
  });
};

const createOrder = async (req, res) => {
  try {
    console.log('[PayPal] Initializing order creation...');
    
    // Validate request body
    if (!req.body) {
      console.error('[PayPal] Missing request body');
      return res.status(400).json({
        success: false,
        message: 'Missing request data'
      });
    }

    console.log('[PayPal] Request payload:', JSON.stringify(req.body, null, 2));
    
    const {
      userId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
      paymentId,
      payerId,
      cartId,
    } = req.body;

    if (!Array.isArray(cartItems)) {
      return res.status(400).json({ success: false, message: "Invalid cartItems" });
    }

    if (typeof totalAmount !== "number") {
      return res.status(400).json({ success: false, message: "Invalid totalAmount" });
    }

    // Use deployed frontend URL in production, localhost in development
    const FRONTEND_URL = process.env.NODE_ENV === 'production'
      ? 'https://project-ecommerce-ansh-0018.onrender.com'
      : 'http://localhost:5173';

    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: `${FRONTEND_URL}/shop/paypal-return`,
        cancel_url: `${FRONTEND_URL}/shop/paypal-cancel`,
      },
      transactions: [
        {
          item_list: {
            items: cartItems.map((item) => ({
              name: item.title,
              sku: item.productId,
              price: item.price.toFixed(2),
              currency: "USD",
              quantity: item.quantity,
            })),
          },
          amount: {
            currency: "USD",
            total: totalAmount.toFixed(2),
          },
          description: "description",
        },
      ],
    };

    console.log('[PayPal] Creating PayPal payment with config:', {
      intent: create_payment_json.intent,
      payment_method: create_payment_json.payer.payment_method,
      currency: create_payment_json.transactions[0].amount.currency,
      total: create_payment_json.transactions[0].amount.total
    });

    let paymentInfo;
    try {
      paymentInfo = await createPayPalPayment(create_payment_json);
      console.log('[PayPal] Payment created successfully:', paymentInfo.id);
    } catch (paypalError) {
      console.error('[PayPal] Payment creation error:', 
        paypalError.response?.details || 
        paypalError.response || 
        paypalError.message || 
        paypalError
      );
      return res.status(500).json({
        success: false,
        message: 'Error while creating PayPal payment',
        error: paypalError && paypalError.response ? paypalError.response : paypalError
      });
    }

    const newlyCreatedOrder = new Order({
      userId,
      cartId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
      paymentId,
      payerId,
    });

    await newlyCreatedOrder.save();

    const approvalURL = paymentInfo.links.find(
      (link) => link.rel === "approval_url"
    ).href;

    res.status(201).json({
      success: true,
      approvalURL,
      orderId: newlyCreatedOrder._id,
    });
  } catch (e) {
    // Log the error stack and message for debugging
    console.error("createOrder error:", e && e.stack ? e.stack : e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
      error: e && e.message ? e.message : e
    });
  }
};

const capturePayment = async (req, res) => {
  try {
    const { paymentId, payerId, orderId } = req.body;

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order can not be found",
      });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = paymentId;
    order.payerId = payerId;

    for (let item of order.cartItems) {
      let product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Not enough stock for this product ${product.title}`,
        });
      }

      product.totalStock -= item.quantity;

      await product.save();
    }

    const getCartId = order.cartId;
    await Cart.findByIdAndDelete(getCartId);

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order confirmed",
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId });

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
};
