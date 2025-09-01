// (Removed duplicate commented-out code and exports to avoid confusion and ensure only one set of exports is present)

import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import nodemailer from "nodemailer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const frontend_url = "https://madhavs-frontend-hndzgaa4e2hxafbb.centralindia-01.azurewebsites.net/";
<<<<<<< HEAD


=======
>>>>>>> 46dfbd9732dd18d94912eb96767dce55f4e3ddb5
// Nodemailer Transporter (use Gmail or another SMTP service)
const transporter = nodemailer.createTransport({
  service: "gmail", // or SMTP settings like smtp-relay.brevo.com
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // your app password
  },
});

// placing user order for frontend
const placeOrder = async (req, res) => {
  try {
  
    const newOrder = new orderModel({
      userId: req.body.userId,
      username: req.body.name,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });

    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    // Prepare email message
    let message = `
      <h2>🛒 New Order Received</h2>
      <p><b>Order ID:</b> ${newOrder._id}</p>
      <h3>Items:</h3>
      <ul>
    `;

    req.body.items.forEach((item) => {
      message += `<li>${item.name} x${item.quantity}</li>`;
    });

    message += `
      </ul>
      <p><b>Delivery Charges:</b> ₹2</p>
      <p><b>Total:</b> ₹${req.body.amount}</p>
      <p><b>Customer Name:</b> ${req.body.address.name}</p>
      <p><b>Delivery Address:</b> ${req.body.address.address}</p>
    `;

    // Send email to admin
    // await transporter.sendMail({
    //   from: `"Madhav's Kitchen" <${process.env.EMAIL_USER}>`,
    //   to: 'ishaanbharadwaj111@gmail.com' , // replace with your email
    //   subject: "New Order Received ✅",
    //   html: message,
    // });


    // Fetch user from DB
    const user = await userModel.findById(req.body.userId);
    // console.log("User email:", user?.email);
    // Send email to ADMIN (order details)
    await transporter.sendMail({
      from: `"Madhav's Kitchen" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // ✅ send to admin only
      subject: "New Order Received ✅",
      html: message,
    });

    // Send email to CUSTOMER (order confirmation)
    if (user?.email) {
      await transporter.sendMail({
        from: `"Madhav's Kitchen" <${process.env.EMAIL_USER}>`,
        to: user.email, // ✅ real customer email
        subject: "Order Confirmation ✅",
        html: `<h2>Thank you ${user.name}!</h2>
           <p>Your order ${newOrder._id} has been placed successfully.</p>`,
      });
    }

    

    res.json({ success: true, message: "Order placed successfully & sent to email" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error placing order" });
  }
};

// verify order
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
    res.json({ success: false, message: "Error verifying order" });
  }
};

// user orders for frontend
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching user orders" });
  }
};

// listing orders for admin panel
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
    res.json({ success: false, message: "Error fetching orders" });
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
    res.json({ success: false, message: "Error updating status" });
  }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };
