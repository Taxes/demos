import { useState, useRef } from 'react';
import Papa from 'papaparse';
import type { UploadSession } from '../types';
import { autoDetectMapping, generateId } from '../utils';

interface UploadScreenProps {
  onUploadComplete: (session: UploadSession) => void;
}

export default function UploadScreen({ onUploadComplete }: UploadScreenProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size 10MB. Consider splitting into multiple files.');
      setUploading(false);
      return;
    }

    // Validate file type
    const validTypes = ['text/csv'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      setError('Invalid file type. Please upload a CSV file.');
      setUploading(false);
      return;
    }

    try {
      let data: any[][];
      let headers: string[];

      // Parse CSV
      const result = await new Promise<Papa.ParseResult<any>>((resolve, reject) => {
        Papa.parse(file, {
          complete: resolve,
          error: reject,
          skipEmptyLines: true,
        });
      });

      if (result.errors.length > 0) {
        throw new Error('Unable to read file. Please export again from your HRIS.');
      }

      data = result.data;
      headers = data[0];
      data = data.slice(1);

      // Filter out empty rows
      data = data.filter((row) => row.some((cell) => cell !== null && cell !== undefined && cell !== ''));

      if (data.length === 0) {
        setError('File contains no data. Please check your export.');
        setUploading(false);
        return;
      }

      // Auto-detect column mappings
      const columnMappings = autoDetectMapping(headers);

      // Create upload session
      const session: UploadSession = {
        id: generateId(),
        fileName: file.name,
        uploadedAt: new Date(),
        status: 'mapping',
        rowsParsed: data.length,
        rowsValid: 0,
        rowsWithWarnings: 0,
        columnMappings,
        rawData: data,
        validationResults: [],
      };

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onUploadComplete(session);
    } catch (err) {
      console.error('Error parsing file:', err);
      setError('Unable to read file. Please export again from your HRIS.');
    } finally {
      setUploading(false);
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Import Employees</h2>
        <p className="text-lg text-gray-600">Upload a CSV file from your HRIS system</p>
      </div>

      <div
        className={`border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50 scale-[1.02]'
            : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50'
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClickUpload}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploading ? (
          <div className="py-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto mb-6"></div>
            <p className="text-lg font-medium text-gray-700">Processing file...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
          </div>
        ) : (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-full mb-6">
              <svg
                className="w-10 h-10 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-xl font-semibold text-gray-900 mb-2">
              Drag & drop your CSV file here
            </p>
            <p className="text-base text-gray-600 mb-6">
              or click to browse your computer
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-lg">
              <svg
                className="w-4 h-4 text-gray-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm text-gray-600">CSV files only • Maximum 10MB</span>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="mt-6 p-5 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-red-600 mr-3 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      <div className="mt-10 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Need help getting started?</h3>

        <div className="flex flex-wrap gap-3 mb-6">
          <a
            href="#"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            onClick={(e) => e.preventDefault()}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download sample template
          </a>
          <a
            href="#"
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
            onClick={(e) => e.preventDefault()}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View import guide
          </a>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="font-semibold text-gray-900 mb-3 text-sm">Required columns:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              <span className="text-gray-700">First Name</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              <span className="text-gray-700">Last Name</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              <span className="text-gray-700">Email</span>
            </div>
          </div>
          <p className="font-semibold text-gray-900 mb-3 mt-4 text-sm">Optional columns:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
              <span className="text-gray-600">Department</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
              <span className="text-gray-600">Manager Email</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
              <span className="text-gray-600">Job Title</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
              <span className="text-gray-600">Employee ID</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
              <span className="text-gray-600">Start Date</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
