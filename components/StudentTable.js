import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function StudentTable({ students, onRemoveSelfie, onVerifyStudent, onRejectStudent, isAdmin = false }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10);

  useEffect(() => {
    if (!students || !Array.isArray(students)) {
      setFilteredStudents([]);
      return;
    }
    
    // Filter students based on search term
    const filtered = students.filter(student => {
      const searchLower = searchTerm.toLowerCase();
      
      // Safely check if properties exist before using toLowerCase
      const nameMatch = student.firstName && student.lastName ? 
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchLower) : false;
      
      const phoneMatch = student.phone ? 
        student.phone.includes(searchTerm) : false;
      
      const classMatch = student.class ? 
        student.class.toString().includes(searchTerm) : false;
        
      const rollMatch = student.rollNumber ? 
        student.rollNumber.toLowerCase().includes(searchLower) : false;
        
      return nameMatch || phoneMatch || classMatch || rollMatch;
    });
    
    setFilteredStudents(filtered);
  }, [students, searchTerm]);

  // Get current students for pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Handle remove selfie
  const handleRemoveSelfie = (studentId) => {
    if (onRemoveSelfie) {
      onRemoveSelfie(studentId);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h3 className="text-lg font-medium text-gray-900 mb-2 md:mb-0">Student List</h3>
          <div className="relative">
            <input
              type="text"
              placeholder="Search students..."
              className="border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student Details
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                School Info
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentStudents.length > 0 ? (
              currentStudents.map((student, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {student.selfieUrl ? (
                          <img className="h-10 w-10 rounded-full object-cover" src={student.selfieUrl} alt={student.name} />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-sm text-gray-500">Father: {student.fatherName || 'N/A'}</div>
                        <div className="text-sm text-gray-500">
                          {student.gender || 'N/A'}, DoB: {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">School ID: {student.schoolId || 'N/A'}</div>
                    <div className="text-sm text-gray-500">Class: {student.class || 'N/A'}</div>
                    <div className="text-sm text-gray-500">Roll No: {student.rollNumber || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.phone || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{student.email || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{student.address || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        student.status === 'verified' ? 'bg-green-100 text-green-800' : 
                        student.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {student.status === 'verified' ? 'Verified' : 
                         student.status === 'rejected' ? 'Rejected' : 'Pending'}
                      </span>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        student.selfieUrl ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {student.selfieUrl ? 'Selfie Uploaded' : 'No Selfie'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-col space-y-2">
                      <Link href={`/student/profile?id=${student.id || index}`} className="text-blue-600 hover:text-blue-900">
                        View
                      </Link>
                      {isAdmin && (
                        <Link href={`/admin/edit-student?id=${student.id || index}`} className="text-indigo-600 hover:text-indigo-900">
                          Edit
                        </Link>
                      )}
                      {isAdmin && student.selfieUrl && (
                        <button
                          onClick={() => handleRemoveSelfie(student.id || index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove Selfie
                        </button>
                      )}
                      {isAdmin && student.status === 'pending' && (
                        <>
                          <button
                            onClick={() => onVerifyStudent && onVerifyStudent(student.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() => onRejectStudent && onRejectStudent(student.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  {searchTerm ? 'No students found matching your search' : 'No students available'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {filteredStudents.length > studentsPerPage && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstStudent + 1}</span> to{' '}
                <span className="font-medium">
                  {indexOfLastStudent > filteredStudents.length ? filteredStudents.length : indexOfLastStudent}
                </span>{' '}
                of <span className="font-medium">{filteredStudents.length}</span> students
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.ceil(filteredStudents.length / studentsPerPage) }).map((_, index) => {
                  const pageNumber = index + 1;
                  // Only show a few page numbers around current page
                  if (
                    pageNumber === 1 ||
                    pageNumber === Math.ceil(filteredStudents.length / studentsPerPage) ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border ${
                          currentPage === pageNumber
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        } text-sm font-medium`}
                      >
                        {pageNumber}
                      </button>
                    );
                  }
                  
                  // Show ellipsis
                  if (
                    (pageNumber === currentPage - 2 && pageNumber > 1) ||
                    (pageNumber === currentPage + 2 && pageNumber < Math.ceil(filteredStudents.length / studentsPerPage))
                  ) {
                    return (
                      <span key={pageNumber} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>
                    );
                  }
                  
                  return null;
                })}
                
                <button
                  onClick={() => 
                    setCurrentPage(
                      currentPage < Math.ceil(filteredStudents.length / studentsPerPage)
                        ? currentPage + 1
                        : currentPage
                    )
                  }
                  disabled={currentPage === Math.ceil(filteredStudents.length / studentsPerPage)}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === Math.ceil(filteredStudents.length / studentsPerPage)
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
