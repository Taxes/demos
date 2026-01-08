import { useState, useRef } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
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
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      setError('Invalid file type. Please upload a CSV or XLSX file.');
      setUploading(false);
      return;
    }

    try {
      let data: any[][];
      let headers: string[];

      if (file.name.endsWith('.csv')) {
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
      } else {
        // Parse XLSX
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length === 0) {
          throw new Error('File contains no data. Please check your export.');
        }

        data = jsonData as any[][];
        headers = data[0];
        data = data.slice(1);
      }

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
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Import Employees</h2>
        <p className="text-gray-600">Upload a CSV or Excel file from your HRIS system</p>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
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
          accept=".csv,.xlsx"
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploading ? (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Processing file...</p>
          </div>
        ) : (
          <>
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
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
            <p className="text-lg text-gray-700 mb-2">Drag & drop file here</p>
            <p className="text-gray-500 mb-4">or click to browse</p>
            <p className="text-sm text-gray-400">Supported formats: CSV, XLSX (max 10MB)</p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="mt-8 space-y-4">
        <div className="flex gap-4">
          <a
            href="#"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            onClick={(e) => e.preventDefault()}
          >
            Download sample template
          </a>
          <a
            href="#"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            onClick={(e) => e.preventDefault()}
          >
            View guide
          </a>
        </div>

        <div className="text-sm text-gray-600">
          <p className="font-medium mb-2">Sample template includes columns:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>First Name, Last Name, Email (required)</li>
            <li>Department, Manager Email, Job Title (optional)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
