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
    <div className="max-w-6xl mx-auto px-4">
      <div className="mb-8">
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <span>Import Employees</span>
          <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 font-medium">Map Columns</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Map Columns</h2>
        <p className="text-lg text-gray-600">
          File: <span className="font-semibold text-gray-900">{session.fileName}</span> ({session.rowsParsed} rows)
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Map your CSV columns to Expenses.com fields
          </h3>
          <span className="text-sm text-gray-500">
            <span className="text-red-500 font-bold">*</span> Required
          </span>
        </div>

        <div className="space-y-4">
          {mappings.map((mapping, index) => {
            const selectedOption = fieldOptions.find(
              (opt) => opt.value === mapping.expensesFieldName
            );
            return (
              <div
                key={index}
                className="grid grid-cols-[1fr_auto_1fr_auto] gap-4 items-center p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-700">{index + 1}</span>
                  </div>
                  <div className="font-semibold text-gray-900 truncate">
                    "{mapping.csvColumnName}"
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
                <select
                  value={mapping.expensesFieldName}
                  onChange={(e) =>
                    handleMappingChange(index, e.target.value as ExpensesFieldName)
                  }
                  className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-gray-900 bg-white hover:border-gray-400 transition-colors"
                >
                  {fieldOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {selectedOption?.required && (
                  <span className="text-red-500 font-bold text-lg">*</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Preview
          </h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            First 5 rows
          </span>
        </div>

        <div className="overflow-x-auto -mx-8 px-8">
          <table className="min-w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                {mappings
                  .filter((m) => m.expensesFieldName !== 'skip')
                  .map((mapping, index) => (
                    <th
                      key={index}
                      className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-50"
                    >
                      {fieldOptions.find((f) => f.value === mapping.expensesFieldName)
                        ?.label || mapping.expensesFieldName}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  {mappings
                    .filter((m) => m.expensesFieldName !== 'skip')
                    .map((mapping, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap"
                      >
                        {row[mapping.csvColumnIndex] || <span className="text-gray-400">—</span>}
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(errors.length > 0 || warnings.length > 0 || unknownDepartments.size > 0) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            {errors.length > 0 ? (
              <>
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-red-900">{errors.length} errors found</h3>
                  <p className="text-sm text-red-600">These must be fixed before continuing</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-yellow-900">{warnings.length} warnings found</h3>
                  <p className="text-sm text-yellow-600">Review these issues before continuing</p>
                </div>
              </>
            )}
          </div>

          <div className="space-y-3">
            {Array.from(uniqueWarnings.values())
              .slice(0, 5)
              .map((result, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-4 rounded-lg border-l-4 ${
                    result.severity === 'error'
                      ? 'bg-red-50 border-red-500 text-red-800'
                      : 'bg-yellow-50 border-yellow-500 text-yellow-800'
                  }`}
                >
                  <span className="flex-shrink-0 font-semibold text-lg">
                    {result.severity === 'error' ? '✕' : '⚠'}
                  </span>
                  <div>
                    <span className="font-semibold">Row {result.rowIndex + 1}:</span> {result.message}
                  </div>
                </div>
              ))}

            {unknownDepartments.size > 0 && (
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <input
                  type="checkbox"
                  checked={createNewDepartments}
                  onChange={(e) => setCreateNewDepartments(e.target.checked)}
                  className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="text-blue-900">
                  <p className="font-semibold mb-1">Create {unknownDepartments.size} new department(s)</p>
                  <p className="text-sm text-blue-700">
                    {Array.from(unknownDepartments).slice(0, 3).join(', ')}
                    {unknownDepartments.size > 3 && ` and ${unknownDepartments.size - 3} more`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">{rowsValid}</p>
              <p className="text-sm text-gray-600">Valid rows</p>
            </div>
          </div>
          {rowsWithWarnings > 0 && (
            <div className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm">
              <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-yellow-600">{rowsWithWarnings}</p>
                <p className="text-sm text-gray-600">Rows with warnings</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="inline-flex items-center px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!hasRequiredMappings || errors.length > 0}
          className={`inline-flex items-center px-8 py-3 rounded-lg font-semibold text-white transition-all ${
            !hasRequiredMappings || errors.length > 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
          }`}
        >
          Continue
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
