import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import SelfieUpload from '../../components/SelfieUpload';
import { isAuthenticated, getCurrentUser } from '../../utils/auth';

export default function StudentSelfie() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [alreadyVerified, setAlreadyVerified] = useState(false);
  
  useEffect(() => {
    // Check if user is authenticated and get student data
    const checkAuth = async () => {
      try {
        const authUser = await isAuthenticated();
        
        if (!authUser) {
          router.push('/login');
          return;
        }
        
        // Set user data
        setUser(authUser);
        
        // Get phone number from authenticated user
        const phone = authUser.phoneNumber || authUser.phone;
        
        if (!phone) {
          console.error('No phone number found in user data:', authUser);
          setError('Missing phone number. Please logout and login again.');
          setLoading(false);
          return;
        }
        
        try {
          // Fetch student data from API using phone number
          const response = await fetch(`/api/student?phone=${encodeURIComponent(phone)}`);
          
          if (response.ok) {
            const data = await response.json();
            console.log('Student data retrieved:', data);
            
            const studentData = data.student;
            setStudent(studentData);
            
            // Check if student is already verified and has selfie
            if (studentData.status === 'verified' && studentData.selfieUrl) {
              setAlreadyVerified(true);
            }
          } else {
            // If API call fails but user has a selfie URL, consider them verified
            if (authUser.selfieUrl) {
              setAlreadyVerified(true);
            }
          }
        } catch (error) {
          console.error('Error fetching student data:', error);
          // If the user has a selfie, consider them verified even if API fails
          if (authUser.selfieUrl) {
            setAlreadyVerified(true);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Auth check error:', err);
        setError('Authentication failed. Please login again.');
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);
  
  const handleUploadSuccess = async (selfieUrl) => {
    try {
      // The SelfieUpload component now returns the selfie URL
      console.log('Uploading selfie:', selfieUrl);
      
      // In a real app, we would update the student record with the selfie URL
      // Simulating successful upload
      
      // Update user data in localStorage with selfie URL
      const currentUser = await getCurrentUser();
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          selfieUrl: selfieUrl
        };
        
        // Store updated user data in localStorage
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
        localStorage.setItem('bandhan_auth_user', JSON.stringify(updatedUser));
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      // Show success message
      setSuccess('Selfie uploaded successfully! Redirecting to services page...');
      
      // Redirect to services page after a short delay
      setTimeout(() => {
        router.push('/services');
      }, 2000);
    } catch (err) {
      console.error('Error saving selfie URL:', err);
      setError('Failed to save selfie. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <Layout title="Upload Selfie | Bandhan">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Upload Selfie | Bandhan">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">
              Selfie Verification
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {alreadyVerified
                ? "Your account is already verified. You can enjoy student discounts on all services."
                : "Please upload a clear selfie to verify your identity for student discounts."}
            </p>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
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
            
            {success && (
              <div className="rounded-md bg-green-50 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Success
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>{success}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {alreadyVerified ? (
              <div className="text-center">
                <div className="rounded-md bg-green-50 p-6 mb-6">
                  <div className="flex flex-col items-center">
                    <div className="flex-shrink-0 mb-4">
                      <svg className="h-12 w-12 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-green-800">
                      Your account is already verified
                    </h3>
                    <div className="mt-2 text-center text-sm text-green-700">
                      <p className="mb-4">You can now enjoy 30% discount on all services.</p>
                      <div className="flex justify-center space-x-4 mt-6">
                        <Link href="/services" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                          Browse Services
                        </Link>
                        <Link href="/student/profile" className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <SelfieUpload onUploadSuccess={handleUploadSuccess} />
                
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-500">
                      Your selfie will be reviewed by your school administrator for verification.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}