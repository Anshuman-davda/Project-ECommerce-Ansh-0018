const paypal = require("../../helpers/paypal");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

const createOrder = async (req, res) => {
  try {
    console.log("createOrder called with body:", req.body);

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

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      console.log("Invalid cartItems:", cartItems);
      return res.status(400).json({ success: false, message: "cartItems must be a non-empty array" });
    }
    if (typeof totalAmount !== "number") {
      console.log("Invalid totalAmount:", totalAmount);
      return res.status(400).json({ success: false, message: "totalAmount must be a number" });
    }

    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: "https://project-ecommerce-ansh-0018.onrender.com/shop/paypal-return",
        cancel_url: "https://project-ecommerce-ansh-0018.onrender.com/shop/paypal-cancel",
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

    console.log("Creating PayPal payment with:", create_payment_json);

    try {
      const paymentInfo = await new Promise((resolve, reject) => {
  paypal.payment.create(create_payment_json, (error, payment) => {
    if (error) {
      return reject(error);
    }
    resolve(payment);
  });
});

      console.log("PayPal payment created successfully:", paymentInfo);

      const approvalLink = paymentInfo.links.find(
        (link) => link.rel === "approval_url"
      );

      if (!approvalLink) {
        console.error("No approval_url found in PayPal payment links:", paymentInfo.links);
        return res.status(500).json({
          success: false,
          message: "Approval URL not found",
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
        paymentId: paymentInfo.id,
        payerId,
      });

      await newlyCreatedOrder.save();
      console.log("Order saved successfully:", newlyCreatedOrder._id);

      res.status(201).json({
        success: true,
        approvalURL: approvalLink.href,
        orderId: newlyCreatedOrder._id,
      });
    } catch (error) {
      console.error("PayPal payment creation error:", error);
      res.status(500).json({
        success: false,
        message: "Error while creating PayPal payment",
        error: error.message || error,
      });
      return;
    }
  } catch (e) {
    console.error("createOrder exception:", e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
      error: e.message,
    });
  }
};

const capturePayment = async (req, res) => {
  try {
    console.log("capturePayment called with body:", req.body);
    const { paymentId, payerId, orderId } = req.body;

    if (!paymentId || !payerId || !orderId) {
      console.log("Missing paymentId, payerId or orderId");
      return res.status(400).json({
        success: false,
        message: "paymentId, payerId, and orderId are required",
      });
    }

    let order = await Order.findById(orderId);
    if (!order) {
      console.log("Order not found for id:", orderId);
      return res.status(404).json({
        success: false,
        message: "Order can not be found",
      });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = paymentId;
    order.payerId = payerId;

    console.log("Updating stock for order items...");

    for (let item of order.cartItems) {
      let product = await Product.findById(item.productId);

      if (!product) {
        console.log(`Product not found for id: ${item.productId}`);
        return res.status(404).json({
          success: false,
          message: `Product not found with id: ${item.productId}`,
        });
      }

      if (product.totalStock < item.quantity) {
        console.log(`Insufficient stock for product ${product.title}: Available ${product.totalStock}, requested ${item.quantity}`);
        return res.status(400).json({
          success: false,
          message: `Not enough stock for product: ${product.title}`,
        });
      }

      product.totalStock -= item.quantity;
      await product.save();
      console.log(`Updated stock for product ${product.title}: New stock ${product.totalStock}`);
    }

    if(order.cartId) {
      await Cart.findByIdAndDelete(order.cartId);
      console.log("Deleted cart with id:", order.cartId);
    }

    await order.save();
    console.log("Order updated and saved successfully:", order._id);

    res.status(200).json({
      success: true,
      message: "Order confirmed",
      data: order,
    });
  } catch (e) {
    console.error("capturePayment exception:", e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
      error: e.message,
    });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    console.log("getAllOrdersByUser called with params:", req.params);
    const { userId } = req.params;

    const orders = await Order.find({ userId });

    if (!orders.length) {
      console.log("No orders found for user:", userId);
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    console.log(`Found ${orders.length} orders for user: ${userId}`);

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.error("getAllOrdersByUser exception:", e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
      error: e.message,
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    console.log("getOrderDetails called with params:", req.params);
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      console.log("Order not found for id:", id);
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    console.log("Order found:", order._id);

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.error("getOrderDetails exception:", e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
      error: e.message,
    });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
};