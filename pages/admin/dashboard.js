import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import Layout from '../../components/Layout';
import { isAuthenticated, isAdmin } from '../../utils/auth';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [school, setSchool] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingVerification: 0,
    verified: 0,
    rejected: 0
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Admin Dashboard - Starting authentication check');
        
        // Debug user storage in localStorage
        if (typeof window !== 'undefined') {
          console.log('Admin Dashboard - localStorage auth_user:', localStorage.getItem('auth_user'));
          console.log('Admin Dashboard - localStorage bandhan_auth_user:', localStorage.getItem('bandhan_auth_user'));
          console.log('Admin Dashboard - localStorage user:', localStorage.getItem('user'));
          console.log('Admin Dashboard - localStorage userRole:', localStorage.getItem('userRole'));
        }
        
        const authUser = await isAuthenticated();
        console.log('Admin Dashboard - Auth Check Result:', authUser);
        
        if (!authUser) {
          console.log('Admin Dashboard - No auth user found, redirecting to login');
          window.location.href = '/login?role=admin';
          return;
        }
        
        const adminCheck = await isAdmin();
        console.log('Admin Dashboard - Is Admin Check Result:', adminCheck, 'User Role:', authUser.role);
        
        if (!adminCheck) {
          console.log('Admin Dashboard - Not an admin, redirecting to login');
          router.push('/login?role=admin');
          return;
        }
        
        setUser(authUser);
        
        // Fetch admin's school and related students from the database
        try {
          console.log('Fetching school data for admin ID:', authUser.id);
          
          // Get the school data for this admin
          const schoolResponse = await axios.get(`/api/admin/school?adminId=${authUser.id}`);
          const schoolData = schoolResponse.data;
          
          if (!schoolData) {
            setError('No school found for this admin account. Please contact support.');
            setLoading(false);
            return;
          }
          
          console.log('School data received:', schoolData);
          setSchool(schoolData);
          
          // Fetch students for this school
          const studentsResponse = await axios.get(`/api/admin/students?schoolId=${schoolData.id}`);
          const studentsData = studentsResponse.data.students || [];
          
          console.log('Students data received:', studentsData);
          setStudents(studentsData);
          
          // Update stats
          setStats({
            totalStudents: studentsData.length || 0,
            pendingVerification: studentsData.filter(s => s.status === 'pending').length || 0,
            verified: studentsData.filter(s => s.status === 'verified').length || 0,
            rejected: studentsData.filter(s => s.status === 'rejected').length || 0
          });
        } catch (err) {
          console.error('Error fetching school data:', err);
          setError('Failed to load school data. Please try again.');
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
  
  const handleVerifyStudent = async (studentId, newStatus) => {
    try {
      setLoading(true);
      
      // Call the API to update the student status
      await axios.post('/api/admin/verify-student', {
        studentId,
        status: newStatus,
        adminId: user.id
      });
      
      // Get the updated student list
      const studentsResponse = await axios.get(`/api/admin/students?schoolId=${school.id}`);
      const updatedStudents = studentsResponse.data.students || [];
      
      setStudents(updatedStudents);
      
      // Update stats
      setStats({
        totalStudents: updatedStudents.length,
        pendingVerification: updatedStudents.filter(s => s.status === 'pending').length,
        verified: updatedStudents.filter(s => s.status === 'verified').length,
        rejected: updatedStudents.filter(s => s.status === 'rejected').length
      });
      
      setLoading(false);
      
    } catch (err) {
      console.error('Error updating student status:', err);
      setError('Failed to update student status. Please try again.');
    }
  };
  
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (loading) {
    return (
      <Layout title="Admin Dashboard | Bandhan">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Admin Dashboard | Bandhan">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Admin Dashboard
            </h1>
            {school && (
              <p className="mt-1 text-lg text-gray-500">
                {school.name}
              </p>
            )}
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            <Link 
              href="/admin/add-student"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Student
            </Link>
            <Link 
              href="/admin/upload"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Upload Students
            </Link>
            <Link 
              href="/admin/students"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              View All Students
            </Link>
            <Link 
              href="/admin/reports"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Reports & Analytics
            </Link>
          </div>
        </div>
        
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
        
        {/* Stats cards */}
        <div className="mt-8">
          <h2 className="text-lg leading-6 font-medium text-gray-900">Overview</h2>
          <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card - Total Students */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Students
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {stats.totalStudents}
                </dd>
              </div>
            </div>
            
            {/* Card - Pending Verification */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Pending Verification
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-yellow-500">
                  {stats.pendingVerification}
                </dd>
              </div>
            </div>
            
            {/* Card - Verified Students */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Verified Students
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-green-500">
                  {stats.verified}
                </dd>
              </div>
            </div>
            
            {/* Card - Rejected Students */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Rejected Students
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-red-500">
                  {stats.rejected}
                </dd>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent students */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg leading-6 font-medium text-gray-900">Recent Students</h2>
            <Link href="/admin/students" className="text-sm font-medium text-primary hover:text-primary-dark">
              View all
            </Link>
          </div>
          
          <div className="mt-4">
            <div className="flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Phone
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date Added
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {students.slice(0, 5).map((student) => (
                          <tr key={student.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                  {student.selfieUrl ? (
                                    <img className="h-10 w-10 rounded-full" src={student.selfieUrl} alt="" />
                                  ) : (
                                    <svg className="h-6 w-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {student.firstName} {student.lastName}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{student.phone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                student.status === 'verified' 
                                  ? 'bg-green-100 text-green-800' 
                                  : student.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(student.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                {student.status !== 'verified' && (
                                  <button 
                                    onClick={() => handleVerifyStudent(student.id, 'verified')}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    Verify
                                  </button>
                                )}
                                {student.status !== 'rejected' && (
                                  <button 
                                    onClick={() => handleVerifyStudent(student.id, 'rejected')}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Reject
                                  </button>
                                )}
                                {student.status !== 'pending' && (
                                  <button 
                                    onClick={() => handleVerifyStudent(student.id, 'pending')}
                                    className="text-yellow-600 hover:text-yellow-900"
                                  >
                                    Reset
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* School information */}
        {school && (
          <div className="mt-8">
            <h2 className="text-lg leading-6 font-medium text-gray-900">School Information</h2>
            <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {school.name}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  School details and contact information.
                </p>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      School name
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {school.name}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Address
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {`${school.address}, ${school.city}, ${school.state}, ${school.zipCode}`}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Added on
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {formatDate(school.createdAt)}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Total Students
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {stats.totalStudents}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}