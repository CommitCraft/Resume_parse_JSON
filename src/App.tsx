import React, { useState, useCallback } from 'react';
import { FileWithPreview, PersonData } from './types';
import FileUploader from './components/FileUploader';
import DataDisplay from './components/DataDisplay';
import JsonOutput from './components/JsonOutput';
import { extractDataFromFiles, generateMockData } from './utils/fileConverter';
import { FolderInput, FileJson, Github } from 'lucide-react';

function App() {
  const [convertedData, setConvertedData] = useState<PersonData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelected = useCallback(async (files: FileWithPreview[]) => {
    if (files.length > 0) {
      setIsProcessing(true);
      try {
        // Process files and extract data
        const data = await extractDataFromFiles(files);
        setConvertedData(data);
      } catch (error) {
        console.error('Error processing files:', error);
      } finally {
        setIsProcessing(false);
      }
    } else {
      setConvertedData(null);
    }
  }, []);

  const loadDemoData = useCallback(() => {
    setIsProcessing(true);
    // Simulate processing delay
    setTimeout(() => {
      setConvertedData(generateMockData());
      setIsProcessing(false);
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FileJson className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">File to JSON Converter</h1>
          </div>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <Github className="h-5 w-5" />
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-5 space-y-6">
            <div className="bg-white shadow-md rounded-lg p-6">
              <div className="flex items-center mb-4">
                <FolderInput className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-800">Upload Files</h2>
              </div>
              <FileUploader 
                onFilesSelected={handleFilesSelected} 
                isProcessing={isProcessing} 
              />
              <div className="mt-4 flex justify-center">
                <button 
                  onClick={loadDemoData}
                  className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 underline decoration-dashed"
                >
                  Load Demo Data
                </button>
              </div>
            </div>

            {convertedData && (
              <JsonOutput data={convertedData} />
            )}
          </div>

          <div className="md:col-span-7">
            {convertedData ? (
              <DataDisplay data={convertedData} />
            ) : (
              <div className="bg-white shadow-md rounded-lg p-8 flex flex-col items-center justify-center text-center h-80">
                <FileJson className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Data Converted Yet</h3>
                <p className="text-gray-500 max-w-md">
                  Upload your files to convert them into structured JSON data. The application will extract 
                  information like name, contact details, education, experience, skills, and projects.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white mt-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            File to JSON Converter — Convert resume files into structured JSON data
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;