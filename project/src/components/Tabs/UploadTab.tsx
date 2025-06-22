import React, { useState } from 'react';
import { Upload, CheckCircle } from 'lucide-react';

const UploadTab: React.FC = () => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success'>('idle');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file && file.type === 'text/csv') {
      setUploadStatus('success');
      setTimeout(() => {
        setUploadStatus('idle');
      }, 3000);
    } else {
      alert('Please upload a valid CSV file.');
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
        </p>

        <div className="space-y-4">
          <div className="flex justify-center items-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {uploadStatus === 'success' ? (
                  <>
                    <CheckCircle className="w-10 h-10 mb-3 text-success-500" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">File uploaded successfully</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Processing will begin shortly</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">CSV files only</p>
                  </>
                )}
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept=".csv"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadTab;