import { useState, useRef, useEffect } from 'react';
import { parseExcelFile } from '../utils/excelParser';
import * as XLSX from 'xlsx';

export default function FileUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewData, setPreviewData] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    // Check file type
    const fileType = selectedFile.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls'].includes(fileType)) {
      setError('Please upload a valid Excel file (.xlsx or .xls)');
      return;
    }
    
    // Check file size (limit to 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size should be less than 10MB');
      return;
    }
    
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setError('');
    
    // Parse and preview the Excel file
    try {
      const students = await parseExcelFile(selectedFile);
      setPreviewData({
        totalStudents: students.length,
        sampleStudents: students.slice(0, 5) // Show first 5 students for preview
      });
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      setError(error.message);
      setFile(null);
      setFileName('');
      setPreviewData(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      fileInputRef.current.files = e.dataTransfer.files;
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate progress (in a real app, this would be based on actual upload progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 300);
      
      // Parse the Excel file
      const students = await parseExcelFile(file);
      
      // Clear the progress interval
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Call the success callback
      if (onUploadSuccess) {
        onUploadSuccess(students);
      }
      
      // Reset the form after successful upload
      setTimeout(() => {
        setFile(null);
        setFileName('');
        setPreviewData(null);
        setUploadProgress(0);
        setIsUploading(false);
      }, 1000);
    } catch (error) {
      console.error('Error processing Excel file:', error);
      setError(error.message);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Student Data</h3>
        
        <div 
          className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-md"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="space-y-1 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-light focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
              >
                <span>Upload Excel file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  disabled={isUploading}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">Only Excel files (.xlsx, .xls) up to 10MB</p>
          </div>
        </div>
        
        {fileName && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md flex justify-between items-center">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm text-gray-700">{fileName}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setFileName('');
                setPreviewData(null);
              }}
              disabled={isUploading}
              className="text-red-500 hover:text-red-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {previewData && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">File Preview</h4>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">
                Total Students: <span className="font-semibold">{previewData.totalStudents}</span>
              </p>
              <p className="text-sm text-gray-600 mt-1">Sample Student Entries:</p>
              <ul className="mt-2 text-xs text-gray-600 space-y-1">
                {previewData.sampleStudents.map((student, index) => (
                  <li key={index} className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-1 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>
                      {student.name} ({student.class}), Phone: {student.phone}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mt-4 text-red-500 text-sm">{error}</div>
        )}
        
        {isUploading && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <div className="mt-6">
          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-primary-light disabled:cursor-not-allowed"
          >
            {isUploading ? 'Processing...' : 'Upload Student Data'}
          </button>
        </div>
      </div>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <div>
              <p className="text-sm text-yellow-700 mb-2">
                <strong>Required columns in your Excel file:</strong>
              </p>
              <ul className="text-xs text-yellow-700 list-disc list-inside space-y-1 ml-2">
                <li>Name (Student's full name)</li>
                <li>Father's Name</li>
                <li><strong>School name</strong> (Must match exactly with the school's registered name)</li>
                <li>Class (e.g., 10, 12, BA-1)</li>
                <li><strong>Roll no</strong> (Student's roll/registration number)</li>
                <li>Gender (Male/Female/Other)</li>
                <li>Date Of Birth (in DD/MM/YYYY format)</li>
                <li>Address Line-1 (Primary address)</li>
                <li>Address Line-2 (Optional)</li>
                <li>State</li>
                <li>Postal Code</li>
                <li>Email (Student's email address)</li>
                <li>Phone (Student's phone number with country code, e.g., +917001719450)</li>
                <li>Photo (Optional - URL to student photo)</li>
              </ul>
              <div className="mt-4 flex">
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    // Create a sample Excel file on demand
                    const headers = [
                      "Name", "Father's Name", "School name", "Class", "Roll no",
                      "Gender", "Date Of Birth", "Address Line-1", "Address Line-2",
                      "State", "Postal Code", "Email", "Phone", "Photo"
                    ];
                    
                    const sampleData = [
                      [
                        "Rahul Sharma", "Rajesh Sharma", "Bankura Christian Collegiate School",
                        "10", "BCC1001", "Male", "2005-05-15", "123, Park Street",
                        "Shyambazar", "West Bengal", "700001", "rahul.s@example.com",
                        "+917001719450", ""
                      ]
                    ];
                    
                    // Check if the XLSX object is available
                    if (typeof XLSX !== 'undefined') {
                      // Create workbook and sheet
                      const wb = XLSX.utils.book_new();
                      const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
                      XLSX.utils.book_append_sheet(wb, ws, "Students");
                      
                      // Generate a blob and download
                      XLSX.writeFile(wb, "student-template.xlsx");
                    } else {
                      alert("Excel library not loaded. Please download a template from another source.");
                    }
                  }}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  Download Sample Template
                </a>
              </div>
              <p className="text-xs text-yellow-700 mt-2">
                <strong>Note:</strong> School name and Roll no are critical for verification purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
