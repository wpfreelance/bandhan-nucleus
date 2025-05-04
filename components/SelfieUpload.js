import { useState, useRef } from 'react';

export default function SelfieUpload({ onUploadSuccess, existingSelfieUrl }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(existingSelfieUrl || null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    
    if (!file) {
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB. Please select a smaller image.');
      return;
    }
    
    setSelectedFile(file);
    setError('');
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile && !existingSelfieUrl) {
      setError('Please select a selfie image to upload');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // In a real application, this would upload to a server or Firebase Storage
      // For now, we'll use the data URL directly
      console.log('Uploading selfie:', selectedFile ? 'New selfie selected' : 'Using existing selfie');
      
      // Simulate server processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use the previewUrl (which is a data URL) directly if available
      // This ensures the image data is actually preserved across sessions
      const selfieUrl = previewUrl || 'https://via.placeholder.com/400x300?text=Development+Mode+Selfie';
      
      // Call success callback with the data URL
      onUploadSuccess(selfieUrl);
    } catch (err) {
      console.error('Selfie upload error:', err);
      setError('Failed to upload selfie. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  const handleDevBypass = () => {
    // This is only for development mode
    if (process.env.NODE_ENV === 'development') {
      onUploadSuccess('https://via.placeholder.com/400x300?text=Development+Mode+Selfie');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Selfie Upload</h3>
      
      {/* Error message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6 w-full">
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
      
      {/* Selfie preview */}
      <div className="mb-6 w-full flex flex-col items-center">
        <div className="relative w-48 h-48 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-300 mb-4">
          {previewUrl ? (
            <img 
              src={previewUrl} 
              alt="Selfie preview" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        
        {/* Hidden file input */}
        <input
          type="file"
          id="selfieInput"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        
        {/* File selection button */}
        <button
          type="button"
          onClick={triggerFileInput}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          {previewUrl ? 'Change Selfie' : 'Select Selfie'}
        </button>
        
        <p className="mt-2 text-xs text-gray-500 text-center">
          Please upload a clear selfie photo. This will be used for verification purposes.
          <br />
          Maximum file size: 5MB
        </p>
      </div>
      
      {/* Upload button */}
      <div className="mt-4 w-full">
        <button
          type="button"
          onClick={handleUpload}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          disabled={loading || (!selectedFile && !existingSelfieUrl)}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </>
          ) : (
            'Upload Selfie'
          )}
        </button>
      </div>
      
      {/* Development mode bypass */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 w-full">
          <button
            type="button"
            onClick={handleDevBypass}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Skip in Development Mode
          </button>
        </div>
      )}
    </div>
  );
}