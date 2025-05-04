import crypto from 'crypto';
import { getPaymentDetails } from '../../../utils/razorpay';
import { storage } from '../../../server/storage';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, amount, studentId } = req.body;

    // Validate required fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment verification details' });
    }

    // Verify signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Fetch payment details from Razorpay for additional verification if needed
    const paymentDetails = await getPaymentDetails(razorpay_payment_id);
    
    // Store transaction in database if all checks pass
    // This is where you would store the payment record in your database
    // For example:
    /*
    await storage.createTransaction({
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount: amount,
      studentId: studentId,
      status: 'completed',
      timestamp: new Date()
    });
    */
    
    // Return success response
    res.status(200).json({
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount: paymentDetails.amount / 100, // Convert back from paise to rupees
      status: paymentDetails.status
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ 
      message: 'Error verifying payment',
      error: error.message
    });
  }
}