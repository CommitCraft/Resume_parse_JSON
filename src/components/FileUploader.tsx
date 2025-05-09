import React, { useCallback, useState } from 'react';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { FileWithPreview } from '../types';

interface FileUploaderProps {
  onFilesSelected: (files: FileWithPreview[]) => void;
  isProcessing: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelected, isProcessing }) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  }, [isDragging]);

  const processFiles = useCallback((newFiles: File[]) => {
    const processedFiles = Array.from(newFiles).map(file => {
      // Create file preview for supported types
      const fileWithPreview = file as FileWithPreview;
      if (file.type.startsWith('image/')) {
        fileWithPreview.preview = URL.createObjectURL(file);
      }
      return fileWithPreview;
    });
    
    setFiles(prevFiles => [...prevFiles, ...processedFiles]);
    onFilesSelected([...files, ...processedFiles]);
  }, [files, onFilesSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  }, [processFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  }, [processFiles]);

  const removeFile = useCallback((indexToRemove: number) => {
    setFiles(prevFiles => {
      const newFiles = prevFiles.filter((_, index) => index !== indexToRemove);
      onFilesSelected(newFiles);
      return newFiles;
    });
  }, [onFilesSelected]);

  return (
    <div className="w-full">
      <div 
        className={`relative border-2 border-dashed rounded-lg p-8 transition-all duration-300 ease-in-out ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : files.length > 0 
              ? 'border-green-400 bg-green-50' 
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <Upload className={`h-12 w-12 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
          <div className="text-center">
            <p className="text-lg font-medium">
              {isDragging ? 'Drop files here' : 'Drag and drop files here'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or <label className="text-blue-600 hover:text-blue-800 cursor-pointer">
                browse
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileInputChange}
                  disabled={isProcessing}
                />
              </label>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Upload resume files (PDF, DOCX, TXT, etc.)
            </p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-gray-700">Selected files ({files.length})</p>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li 
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <span className="text-sm truncate max-w-[200px] md:max-w-xs">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <button 
                  onClick={() => removeFile(index)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                  disabled={isProcessing}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isProcessing && (
        <div className="mt-4 flex items-center justify-center p-4 bg-blue-50 rounded-lg">
          <Loader2 className="h-5 w-5 text-blue-500 animate-spin mr-2" />
          <span className="text-sm text-blue-700">Processing files...</span>
        </div>
      )}
    </div>
  );
};

export default FileUploader;