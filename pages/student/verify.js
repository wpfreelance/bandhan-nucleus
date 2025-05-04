import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import OtpVerification from '../../components/OtpVerification';

export default function StudentVerify() {
  const router = useRouter();
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleVerificationSuccess = async (user) => {
    setLoading(true);
    
    try {
      // Store the user role
      localStorage.setItem('userRole', 'student');
      
      // Store user data for later use
      localStorage.setItem('user', JSON.stringify({
        uid: user.uid,
        phoneNumber: user.phoneNumber
      }));
      
      // Try to find the student in our database
      const response = await fetch(`/api/students?phone=${user.phoneNumber}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          const student = data[0];
          
          // Update student verification status
          await fetch(`/api/students/${student.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              isVerified: true
            }),
          });
          
          // Store the student data
          setStudentData(student);
          setVerificationComplete(true);
        } else {
          // No matching student in database
          setError('No matching student record found for this phone number.');
          setVerificationComplete(true);
        }
      } else {
        throw new Error('Failed to check student data');
      }
    } catch (error) {
      console.error('Error during verification:', error);
      setError('Verification failed. Please try again later.');
      setVerificationComplete(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-8 text-center">
          <div className="inline-block p-3 rounded-full bg-white mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {verificationComplete ? 'Verification Complete' : 'Student Verification'}
          </h2>
          <p className="text-blue-100">
            {verificationComplete 
              ? 'Your phone number has been verified'
              : 'Verify your phone number to access student benefits'}
          </p>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Processing your verification...</p>
            </div>
          ) : verificationComplete ? (
            <div className="py-4">
              {error ? (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        Your phone number has been successfully verified.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {studentData ? (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome, {studentData.name}!</h3>
                  <p className="text-gray-600 mb-4">
                    Your student verification is complete. You can now access exclusive 30% discounts on pathology services.
                  </p>
                  
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Phone number verified
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Student record found in database
                    </div>
                    
                    {!studentData.hasUploadedSelfie && (
                      <div className="flex items-center text-sm text-yellow-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Selfie upload pending
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Phone Number Verified</h3>
                  <p className="text-gray-600">
                    While your phone number has been verified, we couldn't find a matching student record in our database. This could be because:
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600">
                    <li>Your school hasn't uploaded your information yet</li>
                    <li>The phone number you used is different from the one in our records</li>
                    <li>There might be a technical issue with our system</li>
                  </ul>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <Link href={studentData ? "/student/profile" : "/"} className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-center">
                  {studentData ? "View Profile" : "Return Home"}
                </Link>
                
                {studentData && !studentData.hasUploadedSelfie && (
                  <Link href="/student/selfie" className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-center">
                    Upload Selfie
                  </Link>
                )}
                
                {studentData && (
                  <Link href="/services" className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-center">
                    Browse Services
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="py-4">
              <p className="text-gray-600 mb-6">
                To verify your identity and access student discounts, please enter your phone number below. We'll send you a one-time password (OTP) to verify.
              </p>
              
              <OtpVerification onVerificationSuccess={handleVerificationSuccess} />
              
              <div className="mt-6 text-center">
                <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Return to Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
