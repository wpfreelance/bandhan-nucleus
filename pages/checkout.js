import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import RazorpayCheckout from '../components/RazorpayCheckout';
import Link from 'next/link';
import axios from 'axios';

export default function Checkout({ user: propUser, ...props }) {
  const router = useRouter();
  const [selectedServices, setSelectedServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  
  // Load the Razorpay SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  
  // Fetch selected services from localStorage or a service ID from the query params
  // Initialize development user for testing
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Set development mode flag for easy testing
      localStorage.setItem('FIREBASE_DEV_MODE', 'true');
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    
    // Check for user authentication
    const checkAuth = async () => {
      try {
        // Check if the component has access to Firebase auth from props
        if (propUser) {
          console.log('User found in props:', propUser);
          setUser(propUser);
          return;
        }
        
        // Check the window object for Firebase auth
        if (window.currentUser) {
          console.log('User found in window object:', window.currentUser);
          setUser(window.currentUser);
          return;
        }
        
        // First check for Firebase auth in localStorage
        const auth = localStorage.getItem('user');
        if (auth) {
          const userData = JSON.parse(auth);
          console.log('User found in localStorage:', userData);
          setUser(userData);
          return;
        }
        
        // For backward compatibility, check other auth storage keys
        const authUser = localStorage.getItem('authUser');
        if (authUser) {
          const userData = JSON.parse(authUser);
          console.log('User found in authUser:', userData);
          setUser(userData);
          return;
        }
        
        // Direct check of Firebase auth in DevMode
        if (localStorage.getItem('FIREBASE_DEV_MODE') === 'true') {
          console.log('Setting development user');
          const devUser = {
            uid: 'dev-uid-' + Date.now(),
            phoneNumber: '+917001719450'
          };
          setUser(devUser);
          // Also save it to localStorage for consistent access
          localStorage.setItem('user', JSON.stringify(devUser));
          return;
        }
        
        console.log('No user found in any storage location');
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };
    
    // Get selected services
    const getSelectedServices = async () => {
      try {
        // Try to get from localStorage cart
        const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
        
        // If no cart items but serviceId in query params, fetch that service
        if (cartItems.length === 0 && router.query.serviceId) {
          const response = await axios.get('/api/services');
          const services = response.data.services || [];
          const selectedService = services.find(service => service.id === router.query.serviceId);
          
          if (selectedService) {
            setSelectedServices([selectedService]);
            setTotalAmount(parseFloat(selectedService.price));
          }
        } else if (cartItems.length > 0) {
          setSelectedServices(cartItems);
          // Calculate total price
          const total = cartItems.reduce((sum, item) => sum + parseFloat(item.price), 0);
          setTotalAmount(total);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    getSelectedServices();
  }, [router.query, propUser]);
  
  const handlePaymentSuccess = (response) => {
    console.log('Payment successful:', response);
    setPaymentComplete(true);
    setPaymentDetails(response);
    
    // Clear cart after successful payment
    localStorage.removeItem('cartItems');
  };
  
  const handlePaymentFailure = (error) => {
    console.error('Payment failed:', error);
    setPaymentError(error.message || 'Payment failed. Please try again.');
  };
  
  return (
    <Layout title="Checkout | Bandhan">
      <div className="py-10 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Checkout</h1>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : paymentComplete ? (
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="rounded-md bg-green-50 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Payment Successful
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>Your payment has been processed successfully.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <h2 className="text-lg font-medium mb-4">Payment Details</h2>
              {paymentDetails && (
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Payment ID</dt>
                    <dd className="mt-1 text-sm text-gray-900">{paymentDetails.paymentId}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Order ID</dt>
                    <dd className="mt-1 text-sm text-gray-900">{paymentDetails.orderId}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Amount</dt>
                    <dd className="mt-1 text-sm text-gray-900">₹{paymentDetails.amount}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1 text-sm text-gray-900">{paymentDetails.status}</dd>
                  </div>
                </dl>
              )}
              
              <div className="mt-8 flex justify-center">
                <Link href="/services" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                  Continue Shopping
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                  <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                  
                  {selectedServices.length === 0 ? (
                    <p className="text-gray-500">Your cart is empty. Please add some services to checkout.</p>
                  ) : (
                    <div className="space-y-4">
                      {selectedServices.map((service) => (
                        <div key={service.id} className="flex justify-between items-center border-b pb-4">
                          <div>
                            <h3 className="font-medium">{service.name}</h3>
                            <p className="text-sm text-gray-500">{service.description?.substring(0, 100)}...</p>
                          </div>
                          <div className="text-right">
                            {service.originalPrice && (
                              <p className="text-sm text-gray-500 line-through">₹{service.originalPrice}</p>
                            )}
                            <p className="font-semibold">₹{service.price}</p>
                            {service.discountPercentage && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                {service.discountPercentage} Off
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {user ? (
                  <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Your Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <div className="mt-1 p-2 bg-gray-100 rounded-md">
                          {user.phoneNumber}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Login Required</h2>
                    <p className="text-gray-500 mb-4">Please login to continue with the checkout process.</p>
                    <Link href="/login" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                      Login to Continue
                    </Link>
                  </div>
                )}
              </div>
              
              <div className="md:col-span-1">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>
                  
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between mb-2">
                      <span>Subtotal</span>
                      <span>₹{totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2 font-semibold">
                      <span>Total</span>
                      <span>₹{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {paymentError && (
                    <div className="rounded-md bg-red-50 p-4 mt-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-red-800">{paymentError}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-6">
                    {user && selectedServices.length > 0 ? (
                      <RazorpayCheckout
                        amount={totalAmount}
                        onSuccess={handlePaymentSuccess}
                        onFailure={handlePaymentFailure}
                        name="Nucleus Diagnostics"
                        description="Medical Services"
                        userDetails={{
                          name: user.fullName || user.displayName,
                          phone: user.phoneNumber,
                          studentId: user.uid
                        }}
                      />
                    ) : (
                      <button
                        className="w-full bg-gray-300 text-gray-500 cursor-not-allowed font-medium py-2 px-4 rounded-md"
                        disabled
                      >
                        {!user ? 'Login to Pay' : 'Add Items to Cart'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}