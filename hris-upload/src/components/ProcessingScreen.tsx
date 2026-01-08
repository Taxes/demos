import { useState, useEffect } from 'react';
import type { UploadSession } from '../types';

interface ProcessingScreenProps {
  session: UploadSession;
  onComplete: () => void;
}

export default function ProcessingScreen({
  session,
  onComplete,
}: ProcessingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [processed, setProcessed] = useState(0);

  useEffect(() => {
    // Simulate processing with realistic progress
    const totalRows = session.rowsValid;
    const duration = Math.min(3000 + totalRows * 10, 30000); // 3-30 seconds
    const updateInterval = 100; // Update every 100ms
    const incrementPerUpdate = (100 * updateInterval) / duration;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = Math.min(prev + incrementPerUpdate, 100);

        // Update processed count
        setProcessed(Math.floor((newProgress / 100) * totalRows));

        if (newProgress >= 100) {
          clearInterval(interval);
          // Wait a bit before transitioning
          setTimeout(() => {
            onComplete();
          }, 500);
        }

        return newProgress;
      });
    }, updateInterval);

    return () => clearInterval(interval);
  }, [session.rowsValid, onComplete]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Importing Employees...
        </h2>

        <div className="mb-6">
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                  In Progress
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-blue-600">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-3 mb-4 text-xs flex rounded bg-blue-200">
              <div
                style={{ width: `${progress}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-300"
              ></div>
            </div>
          </div>

          <p className="text-center text-gray-600 mb-2">
            {processed} of {session.rowsValid} employees processed
          </p>
          <p className="text-center text-sm text-gray-500">
            This may take a minute. Don't close this page.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  );
}
