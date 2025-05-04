import '../styles/globals.css';
import { useEffect, useState } from 'react';
import { initializeFirebase } from '../utils/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Navbar from '../components/Navbar';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Set up global Razorpay key ID
  const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  useEffect(() => {
    // Initialize Firebase
    const { auth } = initializeFirebase();
    
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth || getAuth(), (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      // Store user data in localStorage for easy access
      if (currentUser) {
        const userData = {
          uid: currentUser.uid,
          email: currentUser.email,
          phoneNumber: currentUser.phoneNumber
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Make user available globally for components
        window.currentUser = userData;
        
        // In development mode, set a flag to allow easier debugging
        if (process.env.NODE_ENV === 'development') {
          localStorage.setItem('FIREBASE_DEV_MODE', 'true');
        }
      } else {
        localStorage.removeItem('user');
        window.currentUser = null;
      }
    });

    // Initialize Razorpay key in window object
    if (razorpayKeyId) {
      window.RAZORPAY_KEY_ID = razorpayKeyId;
    }
    
    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      </Head>
      <Component {...pageProps} user={user} loading={loading} />
    </>
  );
}

export default MyApp;
