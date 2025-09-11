const { client } = require("../../helpers/paypal");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

const createOrder = async (req, res) => {
  try {
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

    // Create PayPal order
    const request = new (require('@paypal/checkout-server-sdk').orders.OrdersCreateRequest)();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: totalAmount.toFixed(2)
        },
        items: cartItems.map(item => ({
          name: item.title,
          unit_amount: {
            currency_code: 'USD',
            value: item.price.toFixed(2)
          },
          quantity: item.quantity.toString(),
          sku: item.productId
        }))
      }],
      application_context: {
        return_url: `${process.env.FRONTEND_URL || 'https://project-ecommerce-ansh-0018.onrender.com'}/shop/paypal-return`,
        cancel_url: `${process.env.FRONTEND_URL || 'https://project-ecommerce-ansh-0018.onrender.com'}/shop/paypal-cancel`
      }
    });

    const paypalOrder = await client().execute(request);

    // Create order in database
    const newlyCreatedOrder = new Order({
      userId,
      cartId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod: "paypal",
      paymentStatus: "pending",
      totalAmount,
      orderDate,
      orderUpdateDate,
      paymentId: paypalOrder.result.id,
      payerId: "",
    });

    await newlyCreatedOrder.save();

    res.status(201).json({
      success: true,
      orderId: paypalOrder.result.id,
      approvalUrl: paypalOrder.result.links.find(link => link.rel === 'approve').href,
      dbOrderId: newlyCreatedOrder._id
    });

  } catch (e) {
    console.log('PayPal order creation error:', e);
    res.status(500).json({
      success: false,
      message: "Error creating PayPal order",
    });
  }
};

const capturePayment = async (req, res) => {
  try {
    const { orderId, dbOrderId } = req.body;

    // Capture PayPal payment
    const request = new (require('@paypal/checkout-server-sdk').orders.OrdersCaptureRequest)(orderId);
    request.requestBody({});

    const capture = await client().execute(request);

    if (capture.result.status === 'COMPLETED') {
      // Update database order
      let order = await Order.findById(dbOrderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      order.paymentStatus = "paid";
      order.orderStatus = "confirmed";
      order.paymentId = orderId;

      // Update product stock
      for (let item of order.cartItems) {
        let product = await Product.findById(item.productId);

        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product not found: ${item.title}`,
          });
        }

        if (product.totalStock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Not enough stock for product: ${product.title}`,
          });
        }

        product.totalStock -= item.quantity;
        await product.save();
      }

      // Clear cart
      const getCartId = order.cartId;
      await Cart.findByIdAndDelete(getCartId);

      await order.save();

      res.status(200).json({
        success: true,
        message: "Payment captured successfully",
        data: order,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Payment not completed",
      });
    }
  } catch (e) {
    console.log('PayPal capture error:', e);
    res.status(500).json({
      success: false,
      message: "Error capturing payment",
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
      message: "Some error occurred!",
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
      message: "Some error occurred!",
    });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
};