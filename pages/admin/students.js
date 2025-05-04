import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { isAdmin } from '../../utils/auth';
import StudentTable from '../../components/StudentTable';

export default function AdminStudents() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const adminStatus = await isAdmin();
      if (!adminStatus) {
        router.push('/login?role=admin');
        return;
      }
      
      fetchStudents();
    };
    
    checkAuth();
  }, [router]);

  const fetchStudents = async () => {
    try {
      // Get admin ID from localStorage - check all possible storage locations
      let adminId = null;
      
      // Try auth_user first
      const authUserData = localStorage.getItem('auth_user');
      if (authUserData) {
        try {
          const parsedData = JSON.parse(authUserData);
          adminId = parsedData.id;
          console.log("Found admin ID in auth_user:", adminId);
        } catch (err) {
          console.error('Error parsing auth_user data:', err);
        }
      }
      
      // If not found, try bandhan_auth_user
      if (!adminId) {
        const bandhanAuthUserData = localStorage.getItem('bandhan_auth_user');
        if (bandhanAuthUserData) {
          try {
            const parsedData = JSON.parse(bandhanAuthUserData);
            adminId = parsedData.id;
            console.log("Found admin ID in bandhan_auth_user:", adminId);
          } catch (err) {
            console.error('Error parsing bandhan_auth_user data:', err);
          }
        }
      }
      
      // Finally, try user
      if (!adminId) {
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const parsedData = JSON.parse(userData);
            adminId = parsedData.id;
            console.log("Found admin ID in user:", adminId);
          } catch (err) {
            console.error('Error parsing user data:', err);
          }
        }
      }
      
      if (!adminId) {
        throw new Error('Admin ID not found. Please log in again.');
      }
      
      const response = await fetch(`/api/admin/students?adminId=${adminId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      
      const data = await response.json();
      setStudents(data.students || []);
      console.log("Students data received:", data.students);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load student data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveSelfie = async (studentId) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hasUploadedSelfie: false,
          selfieUrl: ''
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove selfie');
      }
      
      // Update the students list
      setStudents(prevStudents => 
        prevStudents.map(student => 
          student.id === studentId ? 
            { ...student, hasUploadedSelfie: false, selfieUrl: '' } : 
            student
        )
      );
      
      setSuccessMessage('Selfie removed successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error removing selfie:', error);
      setError('Failed to remove selfie. Please try again.');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Students</h1>
          <p className="text-gray-600">View, verify, and manage student data</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/admin/dashboard" className="py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7m-7-7v14" />
            </svg>
            Dashboard
          </Link>
          <Link href="/admin/upload" className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
            </svg>
            Upload Students
          </Link>
        </div>
      </div>
      
      {error && (
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
      )}
      
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {students.length > 0 ? (
          <StudentTable 
            students={students} 
            onRemoveSelfie={handleRemoveSelfie} 
            isAdmin={true} 
          />
        ) : (
          <div className="p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No students found</h3>
            <p className="mt-1 text-gray-500">Upload student data to get started.</p>
            <div className="mt-6">
              <Link href="/admin/upload" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                </svg>
                Upload Students
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
