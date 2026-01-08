import { useState, useEffect } from 'react';
import type { UploadSession, ColumnMapping, ExpensesFieldName, ValidationResult } from '../types';
import { validateAllRows, getMappedValue } from '../utils';

interface MappingScreenProps {
  session: UploadSession;
  onMappingComplete: (session: UploadSession) => void;
  onBack: () => void;
  createNewDepartments: boolean;
  setCreateNewDepartments: (value: boolean) => void;
}

const fieldOptions: { value: ExpensesFieldName; label: string; required?: boolean }[] = [
  { value: 'firstName', label: 'First Name', required: true },
  { value: 'lastName', label: 'Last Name', required: true },
  { value: 'email', label: 'Email', required: true },
  { value: 'department', label: 'Department' },
  { value: 'managerEmail', label: 'Manager Email' },
  { value: 'jobTitle', label: 'Job Title' },
  { value: 'employeeId', label: 'Employee ID' },
  { value: 'startDate', label: 'Start Date' },
  { value: 'skip', label: 'Skip this column' },
];

export default function MappingScreen({
  session,
  onMappingComplete,
  onBack,
  createNewDepartments,
  setCreateNewDepartments,
}: MappingScreenProps) {
  const [mappings, setMappings] = useState<ColumnMapping[]>(session.columnMappings);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [rowsValid, setRowsValid] = useState(0);
  const [rowsWithWarnings, setRowsWithWarnings] = useState(0);

  useEffect(() => {
    // Validate on mount and when mappings change
    const results = validateAllRows(session.rawData, mappings);
    setValidationResults(results.validationResults);
    setRowsValid(results.rowsValid);
    setRowsWithWarnings(results.rowsWithWarnings);
  }, [mappings, session.rawData]);

  const handleMappingChange = (index: number, newValue: ExpensesFieldName) => {
    const newMappings = [...mappings];
    newMappings[index] = {
      ...newMappings[index],
      expensesFieldName: newValue,
    };
    setMappings(newMappings);
  };

  const handleContinue = () => {
    const updatedSession: UploadSession = {
      ...session,
      columnMappings: mappings,
      validationResults,
      rowsValid,
      rowsWithWarnings,
    };
    onMappingComplete(updatedSession);
  };

  // Get preview rows (first 5)
  const previewRows = session.rawData.slice(0, 5);

  // Get unique departments
  const unknownDepartments = new Set<string>();
  session.rawData.forEach((row) => {
    const dept = getMappedValue(row, mappings, 'department');
    if (dept && dept !== '') {
      unknownDepartments.add(dept);
    }
  });

  // Group validation results by severity
  const errors = validationResults.filter((v) => v.severity === 'error');
  const warnings = validationResults.filter((v) => v.severity === 'warning');

  // Get unique warnings to display
  const uniqueWarnings = new Map<string, ValidationResult>();
  warnings.forEach((w) => {
    const key = `${w.field}-${w.message}`;
    if (!uniqueWarnings.has(key)) {
      uniqueWarnings.set(key, w);
    }
  });

  const hasRequiredMappings = mappings.some((m) => m.expensesFieldName === 'firstName') &&
    mappings.some((m) => m.expensesFieldName === 'lastName') &&
    mappings.some((m) => m.expensesFieldName === 'email');

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Import Employees › Map Columns
        </h2>
        <p className="text-gray-600">
          File: {session.fileName} ({session.rowsParsed} rows)
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Map your CSV columns to Expenses.com fields:
        </h3>

        <div className="space-y-3">
          {mappings.map((mapping, index) => {
            const selectedOption = fieldOptions.find(
              (opt) => opt.value === mapping.expensesFieldName
            );
            return (
              <div
                key={index}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded"
              >
                <div className="flex-1 font-medium text-gray-700">
                  "{mapping.csvColumnName}"
                </div>
                <div className="text-gray-400">→</div>
                <select
                  value={mapping.expensesFieldName}
                  onChange={(e) =>
                    handleMappingChange(index, e.target.value as ExpensesFieldName)
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {fieldOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {selectedOption?.required && (
                  <span className="text-red-500 font-bold">*</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Preview (first 5 rows):
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                {mappings
                  .filter((m) => m.expensesFieldName !== 'skip')
                  .map((mapping, index) => (
                    <th
                      key={index}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50"
                    >
                      {fieldOptions.find((f) => f.value === mapping.expensesFieldName)
                        ?.label || mapping.expensesFieldName}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {previewRows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {mappings
                    .filter((m) => m.expensesFieldName !== 'skip')
                    .map((mapping, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
                      >
                        {row[mapping.csvColumnIndex] || '-'}
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(errors.length > 0 || warnings.length > 0) && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {errors.length > 0 ? `${errors.length} errors found` : `${warnings.length} warnings found`}
          </h3>

          <div className="space-y-2">
            {Array.from(uniqueWarnings.values())
              .slice(0, 5)
              .map((result, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2 p-3 rounded ${
                    result.severity === 'error'
                      ? 'bg-red-50 text-red-800'
                      : 'bg-yellow-50 text-yellow-800'
                  }`}
                >
                  <span className="font-semibold">
                    {result.severity === 'error' ? '⚠' : 'ℹ'}
                  </span>
                  <span>
                    Row {result.rowIndex + 1}: {result.message}
                  </span>
                </div>
              ))}

            {unknownDepartments.size > 0 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded">
                <input
                  type="checkbox"
                  checked={createNewDepartments}
                  onChange={(e) => setCreateNewDepartments(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-blue-800">
                  Create {unknownDepartments.size} new department(s):{' '}
                  {Array.from(unknownDepartments).slice(0, 3).join(', ')}
                  {unknownDepartments.size > 3 && `, and ${unknownDepartments.size - 3} more`}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="text-sm text-gray-600">
          <p className="font-medium mb-2">Summary:</p>
          <ul className="space-y-1">
            <li>
              <span className="font-semibold text-green-600">{rowsValid}</span> valid rows
            </li>
            {rowsWithWarnings > 0 && (
              <li>
                <span className="font-semibold text-yellow-600">{rowsWithWarnings}</span>{' '}
                rows with warnings
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          ← Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!hasRequiredMappings || errors.length > 0}
          className={`px-6 py-2 rounded-md text-white ${
            !hasRequiredMappings || errors.length > 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
