import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { isAdmin } from '../../utils/auth';
import Layout from '../../components/Layout';

export default function AdminReports() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [reports, setReports] = useState({
    totalStudents: 0,
    pendingVerifications: 0,
    verifiedStudents: 0,
    rejectedStudents: 0,
    discountApplications: 0,
    activeDiscounts: 0,
    studentsByClass: [],
    verificationTrend: []
  });

  useEffect(() => {
    const checkAuth = async () => {
      const adminStatus = await isAdmin();
      if (!adminStatus) {
        router.push('/login?role=admin');
        return;
      }
      
      fetchReportData();
    };
    
    checkAuth();
  }, [router]);

  const fetchReportData = async () => {
    try {
      // Get admin ID from localStorage - check all possible storage locations
      let adminId = null;
      
      // Try auth_user first
      const authUserData = localStorage.getItem('auth_user');
      if (authUserData) {
        try {
          const parsedData = JSON.parse(authUserData);
          adminId = parsedData.id;
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
          } catch (err) {
            console.error('Error parsing user data:', err);
          }
        }
      }
      
      if (!adminId) {
        throw new Error('Admin ID not found. Please log in again.');
      }
      
      // Fetch school information
      const schoolResponse = await fetch(`/api/admin/school?adminId=${adminId}`);
      if (!schoolResponse.ok) {
        throw new Error('Failed to fetch school information');
      }
      const schoolData = await schoolResponse.json();
      setSchoolInfo(schoolData);
      
      // Fetch students for reports
      const studentsResponse = await fetch(`/api/admin/students?adminId=${adminId}`);
      if (!studentsResponse.ok) {
        throw new Error('Failed to fetch students data');
      }
      const studentsData = await studentsResponse.json();
      const students = studentsData.students || [];
      
      // Fetch discount applications
      const discountsResponse = await fetch(`/api/admin/discount-applications?schoolId=${schoolData.id}`);
      let discountApplications = [];
      if (discountsResponse.ok) {
        const discountsData = await discountsResponse.json();
        discountApplications = discountsData.applications || [];
      }
      
      // Process data for reports
      const pendingVerifications = students.filter(s => s.status === 'pending').length;
      const verifiedStudents = students.filter(s => s.status === 'verified').length;
      const rejectedStudents = students.filter(s => s.status === 'rejected').length;
      const activeDiscounts = discountApplications.filter(d => d.isActive).length;
      
      // Group students by class
      const classCounts = {};
      students.forEach(student => {
        const className = student.class || 'Unspecified';
        classCounts[className] = (classCounts[className] || 0) + 1;
      });
      
      const studentsByClass = Object.entries(classCounts).map(([className, count]) => ({
        className,
        count
      }));
      
      // Generate verification trend (simplified mock data for now)
      // In a real implementation, this would come from the database with actual dates
      const verificationTrend = [
        { date: '2025-04-15', count: Math.min(verifiedStudents, 5) },
        { date: '2025-04-22', count: Math.min(verifiedStudents, 8) },
        { date: '2025-04-29', count: Math.min(verifiedStudents, 12) },
        { date: '2025-05-01', count: verifiedStudents }
      ];
      
      setReports({
        totalStudents: students.length,
        pendingVerifications,
        verifiedStudents,
        rejectedStudents,
        discountApplications: discountApplications.length,
        activeDiscounts,
        studentsByClass,
        verificationTrend
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching report data:', error);
      setError('Failed to load report data. Please try again later.');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout title="School Reports | Bandhan">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="School Reports | Bandhan">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">School Administrator Reports</h1>
            <p className="text-gray-600">Analytics and performance reports for {schoolInfo?.name || 'your school'}</p>
          </div>
          <div className="flex space-x-3">
            <Link href="/admin/dashboard" className="py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7m-7-7v14" />
              </svg>
              Dashboard
            </Link>
            <Link href="/admin/students" className="py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Students
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
        
        {/* Summary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Students Card */}
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{reports.totalStudents}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Pending Verifications Card */}
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Verifications</p>
                <p className="text-2xl font-bold text-gray-900">{reports.pendingVerifications}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Verified Students Card */}
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified Students</p>
                <p className="text-2xl font-bold text-gray-900">{reports.verifiedStudents}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Active Discounts Card */}
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Discounts</p>
                <p className="text-2xl font-bold text-gray-900">{reports.activeDiscounts}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Detailed Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Students by Class */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Students by Class</h2>
            <div className="space-y-4">
              {reports.studentsByClass.length > 0 ? (
                reports.studentsByClass.map((classData, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-32 text-sm text-gray-700">{classData.className}</div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${(classData.count / reports.totalStudents * 100) || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-12 text-right text-sm text-gray-700">{classData.count}</div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No class data available</p>
              )}
            </div>
          </div>
          
          {/* Verification Status */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Verification Status</h2>
            {reports.totalStudents > 0 ? (
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                      Verified
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-green-600">
                      {Math.round((reports.verifiedStudents / reports.totalStudents) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="flex h-2 mb-4 overflow-hidden text-xs bg-green-200 rounded">
                  <div style={{ width: `${(reports.verifiedStudents / reports.totalStudents) * 100}%` }} className="flex flex-col justify-center text-center text-white bg-green-500 shadow-none"></div>
                </div>
                
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-yellow-600 bg-yellow-200">
                      Pending
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-yellow-600">
                      {Math.round((reports.pendingVerifications / reports.totalStudents) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="flex h-2 mb-4 overflow-hidden text-xs bg-yellow-200 rounded">
                  <div style={{ width: `${(reports.pendingVerifications / reports.totalStudents) * 100}%` }} className="flex flex-col justify-center text-center text-white bg-yellow-500 shadow-none"></div>
                </div>
                
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-red-600 bg-red-200">
                      Rejected
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-red-600">
                      {Math.round((reports.rejectedStudents / reports.totalStudents) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="flex h-2 overflow-hidden text-xs bg-red-200 rounded">
                  <div style={{ width: `${(reports.rejectedStudents / reports.totalStudents) * 100}%` }} className="flex flex-col justify-center text-center text-white bg-red-500 shadow-none"></div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No verification data available</p>
            )}
          </div>
        </div>

        {/* Verification Trend */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Verification Trend</h2>
          {reports.verificationTrend.length > 0 ? (
            <div className="h-64 relative">
              <div className="absolute inset-0 flex items-end justify-between px-4">
                {reports.verificationTrend.map((point, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-10 bg-indigo-500 rounded-t"
                      style={{ 
                        height: `${(point.count / Math.max(...reports.verificationTrend.map(p => p.count))) * 100}%`,
                        minHeight: '10px'
                      }}
                    ></div>
                    <div className="text-xs text-gray-500 mt-2">{new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No trend data available</p>
          )}
        </div>
        
        {/* Export Options */}
        <div className="mt-8 flex space-x-4 justify-end">
          <button 
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => alert('Export as PDF feature coming soon!')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Export as PDF
          </button>
          <button 
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => alert('Export as Excel feature coming soon!')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export as Excel
          </button>
        </div>
      </div>
    </Layout>
  );
}
