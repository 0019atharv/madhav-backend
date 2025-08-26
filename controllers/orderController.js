import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// placing user order for frontend
const placeOrder = async (req, res) => {
  const frontend_url = "https://madhavs-frontend-hndzgaa4e2hxafbb.centralindia-01.azurewebsites.net/";
  try {
    // Debugging line to check the request body
    const newOrder = new orderModel({
      userId: req.body.userId,
      username: req.body.name,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });
   
    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    // Prepare WhatsApp message
    let message = `-> *New Order* \n\nOrder ID: ${newOrder._id}\n\nItems:\n`;

    req.body.items.forEach((item) => {
      message += `- ${item.name} x${item.quantity}\n`;
    });

    message += `\nDelivery Charges: ₹2\nTotal: ₹${req.body.amount}\n\n -> Address: ${req.body.address.address}\n Name: ${req.body.address.name}`;

    // Encode for URL
    const encodedMessage = encodeURIComponent(message);

    // Replace with your Admin WhatsApp number in international format
    const adminPhone = "918527159685"; 

    const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodedMessage}`;



    res.json({ success: true, session_url: whatsappUrl });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};


const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    if (success == "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      res.json({ success: true, message: "Paid" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Not Paid" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// user orders for frontend
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Listing orders for admin pannel
const listOrders = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      const orders = await orderModel.find({});
      res.json({ success: true, data: orders });
    } else {
      res.json({ success: false, message: "You are not admin" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// api for updating status
const updateStatus = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      await orderModel.findByIdAndUpdate(req.body.orderId, {
        status: req.body.status,
      });
      res.json({ success: true, message: "Status Updated Successfully" });
    } else {
      res.json({ success: false, message: "You are not an admin" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };
