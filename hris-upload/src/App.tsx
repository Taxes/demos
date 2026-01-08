import { useState } from 'react';
import UploadScreen from './components/UploadScreen';
import MappingScreen from './components/MappingScreen';
import ConfirmationScreen from './components/ConfirmationScreen';
import ProcessingScreen from './components/ProcessingScreen';
import SuccessScreen from './components/SuccessScreen';
import type { UploadSession, ImportSummary } from './types';

type Screen = 'upload' | 'mapping' | 'confirmation' | 'processing' | 'success';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('upload');
  const [session, setSession] = useState<UploadSession | null>(null);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [sendWelcomeEmails, setSendWelcomeEmails] = useState(true);
  const [createNewDepartments, setCreateNewDepartments] = useState(true);

  const handleUploadComplete = (uploadSession: UploadSession) => {
    setSession(uploadSession);
    setCurrentScreen('mapping');
  };

  const handleMappingComplete = (updatedSession: UploadSession) => {
    setSession(updatedSession);
    setCurrentScreen('confirmation');
  };

  const handleConfirmImport = async (summary: ImportSummary) => {
    setImportSummary(summary);
    setCurrentScreen('processing');
  };

  const handleProcessingComplete = () => {
    setCurrentScreen('success');
  };

  const handleBackToUpload = () => {
    setSession(null);
    setImportSummary(null);
    setCurrentScreen('upload');
  };

  const handleBackToMapping = () => {
    setCurrentScreen('mapping');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Expenses.com</h1>
            <span className="text-sm text-gray-500">Admin Dashboard</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentScreen === 'upload' && (
          <UploadScreen onUploadComplete={handleUploadComplete} />
        )}
        {currentScreen === 'mapping' && session && (
          <MappingScreen
            session={session}
            onMappingComplete={handleMappingComplete}
            onBack={handleBackToUpload}
            createNewDepartments={createNewDepartments}
            setCreateNewDepartments={setCreateNewDepartments}
          />
        )}
        {currentScreen === 'confirmation' && session && (
          <ConfirmationScreen
            session={session}
            onConfirm={handleConfirmImport}
            onBack={handleBackToMapping}
            sendWelcomeEmails={sendWelcomeEmails}
            setSendWelcomeEmails={setSendWelcomeEmails}
          />
        )}
        {currentScreen === 'processing' && session && importSummary && (
          <ProcessingScreen
            session={session}
            onComplete={handleProcessingComplete}
          />
        )}
        {currentScreen === 'success' && importSummary && (
          <SuccessScreen
            summary={importSummary}
            onImportAnother={handleBackToUpload}
            sendWelcomeEmails={sendWelcomeEmails}
          />
        )}
      </main>
    </div>
  );
}

export default App;
