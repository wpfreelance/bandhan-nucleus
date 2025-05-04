import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Log the Firebase environment variables (without revealing values)
console.log('Firebase Config Check:',
  'API Key available:', !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  'Project ID available:', !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  'App ID available:', !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID
);

// Using the provided Firebase config directly for reliable phone authentication
const firebaseConfig = {
  apiKey: "AIzaSyBFkRgg_v5eeBLuaCF-T7q8G1sOnuiy1YM",
  authDomain: "sjo-chat.firebaseapp.com",
  databaseURL: "https://sjo-chat.firebaseio.com",
  projectId: "sjo-chat",
  storageBucket: "sjo-chat.firebasestorage.app",
  messagingSenderId: "498487700637",
  appId: "1:498487700637:web:2bdd5aedf947c0dd95f874"
};

let app;
let auth;
let storage;

export const initializeFirebase = () => {
  try {
    if (!app) {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      storage = getStorage(app);
      console.log('Firebase initialized successfully');
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
  
  return { app, auth, storage };
};

export const setupRecaptcha = (containerId, callback) => {
  try {
    // In development mode, just call the callback directly without setting up recaptcha
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Skipping real reCAPTCHA setup');
      if (callback) setTimeout(callback, 100); // Simulate callback for development
      return {
        clear: () => console.log('Development mode: Mock reCAPTCHA cleared'),
        render: () => Promise.resolve('development-mode-recaptcha'),
        verify: () => Promise.resolve('development-mode-verification')
      };
    }
    
    // Initialize Firebase if not already done
    const { auth } = initializeFirebase();
    
    if (!auth) {
      console.error('Auth not initialized');
      throw new Error('Firebase authentication not initialized');
    }
    
    // Check if container element exists
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container #${containerId} not found`);
      throw new Error(`Recaptcha container not found: #${containerId}`);
    }
    
    // Create the recaptcha verifier
    const recaptchaVerifier = new RecaptchaVerifier(containerId, {
      'size': 'normal',
      'callback': callback,
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
      }
    }, auth);
    
    // Render the recaptcha
    recaptchaVerifier.render().catch(error => {
      console.error('Error rendering reCAPTCHA:', error);
      throw error;
    });
    
    return recaptchaVerifier;
  } catch (error) {
    console.error('Error setting up reCAPTCHA:', error);
    throw error;
  }
};

export const sendOTP = async (phoneNumber, recaptchaVerifier) => {
  try {
    // In development mode, just return a mock confirmation result
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Skipping actual SMS sending to', phoneNumber);
      // Create a mock confirmationResult object
      return {
        confirm: (otp) => {
          // In development mode, check if OTP is the test code ('123456')
          if (otp === '123456') {
            return Promise.resolve({
              user: {
                uid: `dev-uid-${Date.now()}`,
                phoneNumber: phoneNumber,
                providerData: [{ providerId: 'phone', phoneNumber: phoneNumber }]
              }
            });
          } else {
            return Promise.reject(new Error('Invalid OTP code. For development, use "123456"'));
          }
        }
      };
    }
    
    // In production, actually send the SMS
    const auth = getAuth();
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    return confirmationResult;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

export const verifyOTP = async (confirmationResult, otp) => {
  try {
    const result = await confirmationResult.confirm(otp);
    return result.user;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};
