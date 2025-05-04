import { useState } from 'react';
import axios from 'axios';

export default function RazorpayCheckout({ 
  amount, 
  onSuccess, 
  onFailure, 
  name = "Nucleus Diagnostics", 
  description = "Medical Services", 
  userDetails = {},
  notes = {}
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Create an order first
      const orderResponse = await axios.post('/api/payment/create-order', {
        amount: amount,
        notes: {
          studentId: userDetails.studentId,
          ...notes
        }
      });
      
      const order = orderResponse.data;
      
      // Initialize Razorpay
      const razorpay = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || window.RAZORPAY_KEY_ID,
        amount: order.amount, // This will be in paise
        currency: order.currency,
        name: name,
        description: description,
        order_id: order.id,
        prefill: {
          name: userDetails.name || '',
          email: userDetails.email || '',
          contact: userDetails.phone || '',
        },
        notes: {
          studentId: userDetails.studentId,
          ...notes
        },
        theme: {
          color: '#c41b48'
        },
        handler: async function(response) {
          try {
            // Verify the payment with the server
            const verificationResponse = await axios.post('/api/payment/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              amount: amount,
              studentId: userDetails.studentId
            });
            
            if (verificationResponse.data) {
              if (onSuccess) {
                onSuccess(verificationResponse.data);
              }
            }
          } catch (verificationError) {
            console.error('Payment verification failed:', verificationError);
            if (onFailure) {
              onFailure(verificationError);
            }
          }
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            if (onFailure) {
              onFailure(new Error('Payment cancelled by user'));
            }
          }
        }
      });
      
      // Open Razorpay checkout
      razorpay.open();
    } catch (error) {
      console.error('Error initiating payment:', error);
      setError(error.response?.data?.message || 'Failed to process payment');
      setLoading(false);
      if (onFailure) {
        onFailure(error);
      }
    }
  };
  
  return (
    <div className="w-full">
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <button
        type="button"
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-150 ease-in-out"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          <span>Pay ₹{amount}</span>
        )}
      </button>
      
      <p className="mt-2 text-xs text-gray-500 text-center">
        Secure payment powered by Razorpay
      </p>
    </div>
  );
}