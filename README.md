# HRIS Manual Upload Demo

A purely client-side React application demonstrating an HRIS (Human Resources Information System) employee import feature for Expenses.com.

## Features

- **File Upload**: Drag & drop CSV/XLSX files with employee data
- **Smart Column Mapping**: Auto-detects and maps HRIS columns to Expenses.com fields
- **Real-time Validation**: Validates data quality with helpful error and warning messages
- **Preview**: Shows first 5 rows before confirming import
- **Processing Simulation**: Realistic progress tracking with simulated API latency
- **Success Summary**: Clear results showing employees created, updated, and departments added

## Demo

Visit the live demo: [HRIS Upload Demo](https://[your-username].github.io/demos/)

## Local Development

```bash
cd hris-upload
npm install
npm run dev
```

## Build for Production

```bash
cd hris-upload
npm run build
```

## Test Data

A sample CSV file is included at `hris-upload/public/sample_employees.csv` with 10 employee records.

## Architecture

This is a **demo application** built with:

- **React + TypeScript**: Modern UI framework with type safety
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **PapaParse**: CSV parsing library
- **SheetJS (xlsx)**: Excel file parsing library

All processing happens **client-side** - no backend required. State is managed entirely in React with mock delays to simulate realistic API behavior.

## Features Implemented

✅ File upload with drag & drop
✅ CSV and XLSX parsing
✅ Automatic column detection (fuzzy matching)
✅ Data validation (required fields, email format, date format)
✅ Preview table with first 5 rows
✅ Duplicate email detection
✅ New department creation
✅ Import confirmation with summary
✅ Processing simulation with progress bar
✅ Success screen with results
✅ Fully responsive design

## User Flow

1. **Upload**: User uploads CSV/XLSX file from their HRIS
2. **Map Columns**: System auto-detects mappings, user can adjust
3. **Preview & Validate**: See first 5 rows and validation warnings
4. **Confirm**: Review summary of changes before import
5. **Process**: Watch progress as employees are "imported"
6. **Success**: See results and next steps

## MVP Success Criteria

- **Speed**: Upload to preview < 2 seconds ✅
- **Auto-mapping**: 80%+ columns auto-detected ✅
- **Simplicity**: < 3 clicks from upload to import ✅
- **Clear Errors**: Actionable error messages ✅

## License

MIT
