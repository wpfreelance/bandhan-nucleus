import { useState, useEffect } from 'react';
import { validateOTP } from '../utils/auth';
import { initializeFirebase } from '../utils/firebase';

export default function OtpVerification({ onVerificationSuccess }) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Initialize Firebase when component mounts
  useEffect(() => {
    try {
      // Initialize Firebase
      const { app, auth } = initializeFirebase();
      if (app && auth) {
        console.log('Firebase initialized for OTP verification');
      }
    } catch (error) {
      console.error('Failed to initialize Firebase for OTP:', error);
    }
  }, []);
  
  const handleChange = (e) => {
    // Only allow numeric input
    const re = /^[0-9\b]+$/;
    if (e.target.value === '' || re.test(e.target.value)) {
      setOtp(e.target.value);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }
    
    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log('Verifying OTP:', otp);
      
      // In development mode, use the hardcoded OTP for testing
      if (process.env.NODE_ENV === 'development') {
        const isValid = validateOTP(otp);
        console.log('Development mode OTP validation result:', isValid);
        
        if (isValid) {
          // Call the success callback
          onVerificationSuccess();
        } else {
          setError('Invalid OTP. Please try again. For development, use "123456"');
        }
      } else {
        // In production, this would verify with Firebase
        // const result = await verifyOTP(confirmationResult, otp);
        // onVerificationSuccess(result.user);
        
        // For now, use the development mode validation
        const isValid = validateOTP(otp);
        if (isValid) onVerificationSuccess();
        else setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError('OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDevBypass = () => {
    // This is only for development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Bypassing OTP verification');
      onVerificationSuccess();
    }
  };
  
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">OTP Verification</h3>
      
      {/* Error message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
            Enter OTP
          </label>
          <div className="mt-1">
            <input
              id="otp"
              name="otp"
              type="text"
              maxLength={6}
              autoComplete="one-time-code"
              required
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              value={otp}
              onChange={handleChange}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Enter the 6-digit code sent to your phone
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
              <p><strong>Development Mode:</strong> No actual SMS is sent in development mode.</p>
              <p className="mt-1">Use the test code: <strong>123456</strong></p>
              <p className="mt-1">Or use the "Skip in Development Mode" button below.</p>
            </div>
          )}
        </div>

        <div>
          <button
            type="submit"
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </>
            ) : (
              'Verify OTP'
            )}
          </button>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <div>
            <button
              type="button"
              onClick={handleDevBypass}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Skip in Development Mode
            </button>
          </div>
        )}
      </form>
    </div>
  );
}