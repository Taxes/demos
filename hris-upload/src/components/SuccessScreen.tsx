import type { ImportSummary } from '../types';

interface SuccessScreenProps {
  summary: ImportSummary;
  onImportAnother: () => void;
  sendWelcomeEmails: boolean;
}

export default function SuccessScreen({
  summary,
  onImportAnother,
  sendWelcomeEmails,
}: SuccessScreenProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Import Complete!</h2>
          <p className="text-gray-600">
            Successfully imported {summary.newEmployees} employees
          </p>
        </div>

        <div className="border-t border-b border-gray-200 py-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Results:</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span className="text-gray-700">
                {summary.newEmployees} new employee accounts created
              </span>
            </li>
            {summary.updatedEmployees > 0 && (
              <li className="flex items-start gap-2">
                <span className="text-blue-600">✓</span>
                <span className="text-gray-700">
                  {summary.updatedEmployees} existing employees updated
                </span>
              </li>
            )}
            {summary.newDepartments.length > 0 && (
              <li className="flex items-start gap-2">
                <span className="text-purple-600">✓</span>
                <span className="text-gray-700">
                  {summary.newDepartments.length} new department(s) created
                </span>
              </li>
            )}
            {sendWelcomeEmails && (
              <li className="flex items-start gap-2">
                <span className="text-blue-600">✓</span>
                <span className="text-gray-700">
                  {summary.newEmployees} welcome emails sent
                </span>
              </li>
            )}
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Next steps:</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <span className="text-blue-600 font-medium">→ View imported employees</span>
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <span className="text-blue-600 font-medium">→ Set up spending policies</span>
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <span className="text-blue-600 font-medium">→ Order cards in bulk</span>
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onImportAnother}
            className="flex-1 px-6 py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 font-medium"
          >
            Import Another File
          </button>
          <button className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium">
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
