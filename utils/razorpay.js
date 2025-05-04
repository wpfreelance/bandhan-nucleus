import axios from 'axios';
import crypto from 'crypto';

// Initialize Razorpay SDK (if needed in browser context)
export const initRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Create a new Razorpay order - this is for client-side use only
export const createOrder = async (amount, currency = 'INR', receipt = 'order_receipt', notes = {}) => {
  try {
    const response = await axios.post('/api/payment/create-order', {
      amount,
      currency,
      receipt,
      notes
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new Error(error.response?.data?.message || 'Failed to create payment order');
  }
};

// Create a new Razorpay order - this is for server-side direct API call
export const createRazorpayOrder = async (amount, currency = 'INR', receipt = 'order_receipt', notes = {}) => {
  try {
    const Razorpay = require('razorpay');
    
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    
    const order = await instance.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt,
      notes
    });
    
    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

// Verify payment signature
export const verifyPaymentSignature = (orderData, razorpaySignature) => {
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  hmac.update(orderData.razorpay_order_id + '|' + orderData.razorpay_payment_id);
  const generated_signature = hmac.digest('hex');
  
  return generated_signature === razorpaySignature;
};

// Get payment details (for server-side use)
export const getPaymentDetails = async (paymentId) => {
  try {
    // This function should be used server-side only with proper authentication
    const Razorpay = require('razorpay');
    
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    
    const payment = await instance.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Error fetching payment details:', error);
    throw error;
  }
};

// Initiate refund (for server-side use)
export const initiateRefund = async (paymentId, amount) => {
  try {
    // This function should be used server-side only with proper authentication
    const Razorpay = require('razorpay');
    
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    
    const refund = await instance.payments.refund(paymentId, {
      amount
    });
    
    return refund;
  } catch (error) {
    console.error('Error initiating refund:', error);
    throw error;
  }
};