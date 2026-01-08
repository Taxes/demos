// Employee record structure
export interface Employee {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  department?: string;
  managerEmail?: string;
  jobTitle?: string;
  employeeId?: string;
  startDate?: Date;
  status: 'active' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

// Upload session (for tracking state)
export interface UploadSession {
  id: string;
  fileName: string;
  uploadedAt: Date;
  status: 'mapping' | 'confirmed' | 'processing' | 'complete' | 'failed';
  rowsParsed: number;
  rowsValid: number;
  rowsWithWarnings: number;
  columnMappings: ColumnMapping[];
  rawData: any[][];
  validationResults: ValidationResult[];
}

export interface ColumnMapping {
  csvColumnIndex: number;
  csvColumnName: string;
  expensesFieldName: string | 'skip';
}

export interface ValidationResult {
  rowIndex: number;
  severity: 'error' | 'warning';
  field: string;
  message: string;
}

export interface ImportSummary {
  newEmployees: number;
  updatedEmployees: number;
  newDepartments: string[];
}

export type ExpensesFieldName =
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'department'
  | 'managerEmail'
  | 'jobTitle'
  | 'employeeId'
  | 'startDate'
  | 'skip';
