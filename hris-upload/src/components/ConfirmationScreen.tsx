import type { UploadSession, ImportSummary } from '../types';
import { getMappedValue } from '../utils';

interface ConfirmationScreenProps {
  session: UploadSession;
  onConfirm: (summary: ImportSummary) => void;
  onBack: () => void;
  sendWelcomeEmails: boolean;
  setSendWelcomeEmails: (value: boolean) => void;
}

export default function ConfirmationScreen({
  session,
  onConfirm,
  onBack,
  sendWelcomeEmails,
  setSendWelcomeEmails,
}: ConfirmationScreenProps) {
  // Calculate summary
  const existingEmails = new Set<string>(); // In a real app, this would come from the backend
  const newDepartments = new Set<string>();

  let newEmployees = 0;
  let updatedEmployees = 0;

  session.rawData.forEach((row) => {
    const email = getMappedValue(row, session.columnMappings, 'email');
    const department = getMappedValue(row, session.columnMappings, 'department');

    if (email && !existingEmails.has(email.toLowerCase())) {
      newEmployees++;
    } else if (email) {
      updatedEmployees++;
    }

    if (department && department !== '') {
      newDepartments.add(department);
    }
  });

  const handleConfirm = () => {
    const summary: ImportSummary = {
      newEmployees,
      updatedEmployees,
      newDepartments: Array.from(newDepartments),
    };
    onConfirm(summary);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Confirm Import</h2>
        <p className="text-gray-600">
          Ready to import from {session.fileName}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary:</h3>

        <ul className="space-y-3 mb-6">
          <li className="flex items-start gap-2">
            <span className="text-green-600">•</span>
            <span className="text-gray-700">
              <strong>{newEmployees}</strong> new employees will be created
            </span>
          </li>
          {updatedEmployees > 0 && (
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span className="text-gray-700">
                <strong>{updatedEmployees}</strong> existing employees will be updated
              </span>
            </li>
          )}
          {newDepartments.size > 0 && (
            <li className="flex items-start gap-2">
              <span className="text-purple-600">•</span>
              <span className="text-gray-700">
                <strong>{newDepartments.size}</strong> new department(s) will be created:{' '}
                {Array.from(newDepartments).slice(0, 3).join(', ')}
                {newDepartments.size > 3 && `, and ${newDepartments.size - 3} more`}
              </span>
            </li>
          )}
        </ul>

        <div className="border-t border-gray-200 pt-6 mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={sendWelcomeEmails}
              onChange={(e) => setSendWelcomeEmails(e.target.checked)}
              className="mt-1"
            />
            <div>
              <div className="font-medium text-gray-900">
                Send welcome emails to new employees
              </div>
              {sendWelcomeEmails && (
                <div className="text-sm text-gray-500 mt-1">
                  ({newEmployees} emails will be sent)
                </div>
              )}
            </div>
          </label>
        </div>

        {newEmployees > 50 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              <strong>Note:</strong> This will send {newEmployees} welcome emails. Continue?
            </p>
          </div>
        )}

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <p className="text-gray-600 text-sm">
            This action cannot be undone, but you can edit individual employees after import.
          </p>
        </div>

        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Confirm Import
          </button>
        </div>
      </div>
    </div>
  );
}
