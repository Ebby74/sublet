'use client';

import { useState, useRef } from 'react';
import { Upload, FileText } from 'lucide-react';

interface CSVUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
}

export function CSVUpload({ 
  onFileSelect, 
  accept = '.csv',
  maxSize = 10 
}: CSVUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);
    
    if (!file.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }
    
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }
    
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div
        className={`w-full max-w-xl border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging 
            ? 'border-primary bg-primary/5' 
            : selectedFile 
              ? 'border-green-500 bg-green-50' 
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
        />
        
        {selectedFile ? (
          <div className="flex flex-col items-center gap-2">
            <FileText className="h-12 w-12 text-green-500" />
            <p className="font-medium text-foreground">{selectedFile.name}</p>
            <p className="text-sm text-muted-foreground">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground">Drop your CSV file here</p>
            <p className="text-sm text-muted-foreground">or click to browse</p>
            <p className="text-xs text-muted-foreground">Max file size: {maxSize}MB</p>
          </div>
        )}
      </div>
      
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}