import React, { useState, useRef } from 'react';
import { Upload, CheckCircle, Trash2, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const UploadTab: React.FC = () => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadError, setUploadError] = useState('');
  const {
    user,
    session
  } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!user || !session) {
      setUploadError('You must be logged in to upload files');
      setUploadStatus('error');
      return;
    }
    if (!file.type.includes('csv') && !file.name.endsWith('.csv')) {
      setUploadError('Please upload a valid CSV file.');
      setUploadStatus('error');
      return;
    }
    setUploadStatus('uploading');
    setUploadError('');
    setUploadMessage('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload-csv', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      });

      // Check if response is ok first
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload response error:', errorText);
        throw new Error(`Upload failed with status ${response.status}`);
      }

      // Try to parse JSON, but handle cases where response might be empty
      let data;
      const responseText = await response.text();
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', responseText);
        throw new Error('Invalid response from server');
      }
      setUploadStatus('success');
      setUploadMessage(data.message || `Successfully uploaded ${file.name}`);

      // Clear success message after 5 seconds
      setTimeout(() => {
        if (uploadStatus === 'success') {
          setUploadStatus('idle');
          setUploadMessage('');
        }
      }, 5000);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setUploadError(error instanceof Error ? error.message : 'Upload failed. Please try again.');
    }
  };

  const handleRemoveData = () => {
    setUploadStatus('idle');
    setUploadMessage('');
    setUploadError('');
    // Reset the file input properly
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearError = () => {
    setUploadStatus('idle');
    setUploadError('');
    // Reset the file input properly
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
        <div className="flex items-center mb-6">
          <Upload className="h-8 w-8 text-primary-500 mr-3" />
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Upload Data</h2>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Upload your water analysis data in CSV format. The file will be processed and analyzed automatically.
          {!user && (
            <span className="block mt-2 text-sm text-amber-600 dark:text-amber-400 font-medium">
              Note: You must be logged in to upload files.
            </span>
          )}
        </p>

        {/* Expected CSV Format Guide */}
        <div className="mb-6 p-4 rounded-lg bg-white dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-2">Expected CSV Format:</h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
            Your CSV should have the following columns in order:
          </p>
          <code className="text-xs text-gray-800 dark:text-gray-100 px-2 py-1 rounded block bg-gray-100 dark:bg-gray-700">
            location, sample_date, ph_level, iron_ppm, chromium_ppm, manganese_ppm, molybdenum_ppm, indium_ppm, tantalum_ppm
          </code>
        </div>

        <div className="space-y-4">
          <div className="flex justify-center items-center w-full">
            <label className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors
              ${!user ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-50' : uploadStatus === 'uploading' ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20' : uploadStatus === 'success' ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20' : uploadStatus === 'error' ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {uploadStatus === 'uploading' ? <>
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-3"></div>
                    <p className="mb-2 text-sm text-blue-500 dark:text-blue-400">Uploading and processing...</p>
                    <p className="text-xs text-blue-400 dark:text-blue-500">Please wait while we process your file</p>
                  </> : uploadStatus === 'success' ? <>
                    <CheckCircle className="w-10 h-10 mb-3 text-green-500" />
                    <p className="mb-2 text-sm text-green-600 dark:text-green-400 font-medium">Upload Successful!</p>
                    <p className="text-xs text-green-500 dark:text-green-500 text-center px-4">{uploadMessage}</p>
                  </> : uploadStatus === 'error' ? <>
                    <AlertCircle className="w-10 h-10 mb-3 text-red-500" />
                    <p className="mb-2 text-sm text-red-600 dark:text-red-400 font-medium">Upload Failed</p>
                    <p className="text-xs text-red-500 dark:text-red-500 text-center px-4">{uploadError}</p>
                  </> : <>
                    <Upload className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span>
                      {user ? ' or drag and drop' : ' (Login required)'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">CSV files only</p>
                  </>}
              </div>
              <input ref={fileInputRef} type="file" className="hidden" accept=".csv" onChange={handleFileUpload} disabled={!user || uploadStatus === 'uploading'} />
            </label>
          </div>

          {(uploadStatus === 'success' || uploadStatus === 'error') && <div className="flex justify-center mt-4 space-x-3">
              {uploadStatus === 'success' && <button onClick={handleRemoveData} className="flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Status
                </button>}
              {uploadStatus === 'error' && <button onClick={handleClearError} className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200">
                  <X className="w-4 h-4 mr-2" />
                  Clear Error
                </button>}
            </div>}
        </div>

        {/* Upload History or Instructions for logged in users */}
        {user && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">Upload Instructions</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li>• Ensure your CSV file has the correct column headers</li>
              <li>• Date format should be YYYY-MM-DD</li>
              <li>• Numeric values should not include units (ppm will be assumed)</li>
              <li>• Empty cells are allowed and will be stored as null values</li>
              <li>• Files are securely stored and associated with your account</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadTab;
