import { createRazorpayOrder } from '../../../utils/razorpay';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { amount, currency = 'INR', receipt, notes = {} } = req.body;

    // Validate required fields
    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }
    
    // Create a unique receipt ID if not provided
    const receiptId = receipt || `receipt_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    
    // Create an order using the direct Razorpay API
    const order = await createRazorpayOrder(amount, currency, receiptId, notes);
    
    // Return the order details to the client
    res.status(200).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
      created_at: order.created_at
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({ 
      message: 'Error creating payment order',
      error: error.message
    });
  }
}