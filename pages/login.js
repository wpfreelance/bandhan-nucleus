import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import Layout from '../components/Layout';
import OtpVerification from '../components/OtpVerification';
import { isAuthenticated, setAuthenticatedUser } from '../utils/auth';

export default function Login() {
  const router = useRouter();
  const { role = 'student' } = router.query;
  const [mode, setMode] = useState('student'); // 'student' or 'admin'
  
  // Admin login states
  const [adminCredentials, setAdminCredentials] = useState({
    username: '',
    password: ''
  });
  
  // Student login states
  const [phone, setPhone] = useState('');
  const [showOtpForm, setShowOtpForm] = useState(false);
  
  // Common states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const user = await isAuthenticated();
      if (user) {
        // Redirect to appropriate dashboard
        if (user.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/student/profile');
        }
      }
    };
    
    checkAuth();
    
    // Set mode based on URL param
    if (role === 'admin') {
      setMode('admin');
    } else {
      setMode('student');
    }
  }, [role, router]);
  
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setError('');
    
    // Update URL query parameter without reload
    const url = newMode === 'admin' ? '/login?role=admin' : '/login';
    router.push(url, undefined, { shallow: true });
  };
  
  const handleAdminCredentialsChange = (e) => {
    const { name, value } = e.target;
    setAdminCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
  };
  
  // Admin login submission
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    
    if (!adminCredentials.username || !adminCredentials.password) {
      setError('Please enter both username and password');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/admin/login', adminCredentials);
      
      // Store user data in localStorage - use both keys for compatibility
      const userData = response.data.user;
      console.log('Login successful, storing user data:', userData);
      
      // Store with multiple keys for complete compatibility
      localStorage.setItem('auth_user', JSON.stringify(userData));
      localStorage.setItem('bandhan_auth_user', JSON.stringify(userData));
      localStorage.setItem('user', JSON.stringify({
        ...userData,
        uid: userData.id,
        phoneNumber: userData.phone || ''
      }));
      
      // Also store user role explicitly
      localStorage.setItem('userRole', userData.role);
      
      // Redirect to admin dashboard - use a more forceful approach
      console.log('Admin login successful, redirecting to dashboard...');
      
      // Use replace instead of push for more reliable navigation
      window.location.href = '/admin/dashboard';
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Student login - send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    
    if (!phone) {
      setError('Please enter your phone number');
      return;
    }
    
    // Validate phone number format
    if (!phone.startsWith('+91') || phone.length !== 13) {
      setError('Please enter a valid Indian phone number with +91 prefix');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log('Sending OTP to:', phone);
      
      // For development environment, we can skip actual OTP sending
      if (process.env.NODE_ENV === 'development') {
        // Show the OTP verification screen without actually sending SMS
        setShowOtpForm(true);
      } else {
        // In production, we would use Firebase Phone Auth
        // const confirmationResult = await sendOTP(phone, recaptchaVerifier);
        // store confirmationResult for later verification
        setShowOtpForm(true);
      }
    } catch (err) {
      console.error('Error sending OTP:', err);
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Callback when OTP verification is successful
  const handleVerificationSuccess = () => {
    // Store phone number for authenticated user
    setAuthenticatedUser(phone);
    
    // Redirect to selfie upload or profile
    router.push('/student/selfie');
  };
  
  return (
    <Layout title={`${mode === 'admin' ? 'Admin' : 'Student'} Login | Bandhan`}>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {mode === 'admin' 
              ? 'Access your school admin dashboard' 
              : 'Get verified for student discounts'}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {/* Login mode tabs */}
            <div className="mb-6 flex border-b border-gray-200">
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium ${
                  mode === 'student'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => handleModeChange('student')}
              >
                Student Login
              </button>
              <button
                type="button"
                className={`ml-4 px-4 py-2 text-sm font-medium ${
                  mode === 'admin'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => handleModeChange('admin')}
              >
                Admin Login
              </button>
            </div>

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

            {/* Admin login form */}
            {mode === 'admin' && (
              <form className="space-y-6" onSubmit={handleAdminLogin}>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <div className="mt-1">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      value={adminCredentials.username}
                      onChange={handleAdminCredentialsChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      value={adminCredentials.password}
                      onChange={handleAdminCredentialsChange}
                    />
                  </div>
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
                        Signing in...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </div>

                <div>
                  <p className="text-sm text-center text-gray-600">
                    Don't have an admin account?{' '}
                    <Link href="/admin/register" className="font-medium text-primary hover:text-primary-dark">
                      Register here
                    </Link>
                  </p>
                </div>
              </form>
            )}

            {/* Student login form - Phone number */}
            {mode === 'student' && !showOtpForm && (
              <form className="space-y-6" onSubmit={handleSendOtp}>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      placeholder="+91XXXXXXXXXX"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      value={phone}
                      onChange={handlePhoneChange}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Enter your phone number with country code, e.g., +917001719450
                  </p>
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                      <p><strong>Development Mode:</strong> For testing purposes, no actual SMS will be sent. The OTP verification screen will appear without sending an SMS.</p>
                      <p className="mt-1">During verification, enter the test code: <strong>123456</strong></p>
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
                        Sending OTP...
                      </>
                    ) : (
                      'Send OTP'
                    )}
                  </button>
                </div>

                <div>
                  <p className="text-sm text-center text-gray-600">
                    <span className="block">Don't have an account?</span>
                    <span>Student registration is done by your school admin.</span>
                  </p>
                </div>
              </form>
            )}

            {/* Student login form - OTP Verification */}
            {mode === 'student' && showOtpForm && (
              <OtpVerification 
                onVerificationSuccess={handleVerificationSuccess} 
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}