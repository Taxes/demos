import type { ColumnMapping, ValidationResult, ExpensesFieldName } from './types';

// Fuzzy matching for common HRIS column names
const fieldMappings: Record<ExpensesFieldName, string[]> = {
  firstName: ['first name', 'firstname', 'given name', 'fname', 'first'],
  lastName: ['last name', 'lastname', 'surname', 'family name', 'lname', 'last'],
  email: ['email', 'email address', 'work email', 'e-mail', 'mail'],
  department: ['department', 'dept', 'division', 'team'],
  managerEmail: ['manager', 'manager email', 'reports to', 'supervisor', 'supervisor email'],
  jobTitle: ['job title', 'title', 'position', 'role'],
  employeeId: ['employee id', 'emp id', 'id', 'employee number', 'badge number'],
  startDate: ['start date', 'hire date', 'join date', 'employment start', 'date hired'],
  skip: [],
};

export function autoDetectMapping(csvHeaders: string[]): ColumnMapping[] {
  return csvHeaders.map((header, index) => {
    const normalized = header.toLowerCase().trim();

    // Find best match
    for (const [field, patterns] of Object.entries(fieldMappings)) {
      if (patterns.some((pattern) => normalized.includes(pattern))) {
        return {
          csvColumnIndex: index,
          csvColumnName: header,
          expensesFieldName: field as ExpensesFieldName,
        };
      }
    }

    // No match found
    return {
      csvColumnIndex: index,
      csvColumnName: header,
      expensesFieldName: 'skip',
    };
  });
}

export function getMappedValue(
  row: any[],
  mappings: ColumnMapping[],
  field: ExpensesFieldName
): string | undefined {
  const mapping = mappings.find((m) => m.expensesFieldName === field);
  if (!mapping || mapping.csvColumnIndex >= row.length) {
    return undefined;
  }
  const value = row[mapping.csvColumnIndex];
  return value ? String(value).trim() : undefined;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

export function validateRow(
  row: any[],
  mappings: ColumnMapping[],
  rowIndex: number,
  allEmails: Set<string>
): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Extract mapped values
  const email = getMappedValue(row, mappings, 'email');
  const firstName = getMappedValue(row, mappings, 'firstName');
  const lastName = getMappedValue(row, mappings, 'lastName');
  const startDate = getMappedValue(row, mappings, 'startDate');

  // Required field validation
  if (!email) {
    results.push({
      rowIndex,
      severity: 'error',
      field: 'email',
      message: 'Email is required',
    });
  } else if (!isValidEmail(email)) {
    results.push({
      rowIndex,
      severity: 'error',
      field: 'email',
      message: 'Invalid email format',
    });
  } else if (allEmails.has(email.toLowerCase())) {
    results.push({
      rowIndex,
      severity: 'warning',
      field: 'email',
      message: 'Duplicate email - will update existing user',
    });
  }

  if (!firstName) {
    results.push({
      rowIndex,
      severity: 'error',
      field: 'firstName',
      message: 'First name is required',
    });
  }

  if (!lastName) {
    results.push({
      rowIndex,
      severity: 'error',
      field: 'lastName',
      message: 'Last name is required',
    });
  }

  // Date format validation
  if (startDate && !isValidDate(startDate)) {
    results.push({
      rowIndex,
      severity: 'warning',
      field: 'startDate',
      message: 'Date format not recognized, will be skipped',
    });
  }

  return results;
}

export function validateAllRows(
  data: any[][],
  mappings: ColumnMapping[]
): { validationResults: ValidationResult[]; rowsValid: number; rowsWithWarnings: number } {
  const allEmails = new Set<string>();
  const validationResults: ValidationResult[] = [];
  let rowsValid = 0;
  let rowsWithWarnings = 0;

  data.forEach((row) => {
    const email = getMappedValue(row, mappings, 'email');
    if (email) {
      allEmails.add(email.toLowerCase());
    }
  });

  data.forEach((row, index) => {
    const rowResults = validateRow(row, mappings, index, allEmails);
    validationResults.push(...rowResults);

    const hasErrors = rowResults.some((r) => r.severity === 'error');
    const hasWarnings = rowResults.some((r) => r.severity === 'warning');

    if (!hasErrors) {
      rowsValid++;
      if (hasWarnings) {
        rowsWithWarnings++;
      }
    }
  });

  return { validationResults, rowsValid, rowsWithWarnings };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function simulateDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
