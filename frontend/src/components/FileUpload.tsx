import React, { useState, useRef, useCallback } from 'react';
import './FileUpload.css';

interface FileUploadProps {
  onFileUploaded: (data: any) => void;
  acceptedFormats: string[];
  maxSize?: number; // in MB
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileUploaded, 
  acceptedFormats = ['.csv', '.json', '.xlsx'],
  maxSize = 10 // 10MB default max size
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length) {
      handleFile(files[0]);
    }
  }, []);

  const validateFile = (file: File): boolean => {
    // Check file extension
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!acceptedFormats.includes(ext)) {
      setError(`Invalid file format. Accepted formats: ${acceptedFormats.join(', ')}`);
      return false;
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File too large. Maximum size is ${maxSize}MB.`);
      return false;
    }

    return true;
  };

  const processFile = async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      let data;
      
      if (ext === '.json') {
        const text = await file.text();
        data = JSON.parse(text);
      } else if (ext === '.csv') {
        const text = await file.text();
        // Simple CSV parsing - in a real app you'd use a more robust CSV parser
        const rows = text.split('\n');
        const headers = rows[0].split(',');
        data = rows.slice(1).map(row => {
          const values = row.split(',');
          return headers.reduce((obj, header, i) => {
            obj[header.trim()] = values[i]?.trim();
            return obj;
          }, {} as any);
        });
      } else {
        throw new Error('File processing not implemented for this format.');
      }
      
      onFileUploaded(data);
      setFileName(file.name);
    } catch (err) {
      setError(`Error processing file: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('File processing error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      processFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      handleFile(files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-upload-container">
      <div 
        className={`file-upload-area ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="file-input" 
          accept={acceptedFormats.join(',')}
          onChange={handleFileInputChange}
        />
        
        {fileName ? (
          <div className="file-uploaded">
            <div className="file-info">
              <span className="file-name">{fileName}</span>
              <button 
                className="reset-button"
                onClick={() => {
                  setFileName(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                Clear
              </button>
            </div>
            <div className="success-message">File uploaded successfully!</div>
          </div>
        ) : (
          <>
            <div className="upload-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64" fill="currentColor">
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
              </svg>
            </div>
            <h3>Drag & Drop your data file here</h3>
            <p>or</p>
            <button 
              className="browse-button" 
              onClick={handleButtonClick}
              disabled={isLoading}
            >
              Browse Files
            </button>
            <p className="file-types">Supported formats: {acceptedFormats.join(', ')}</p>
          </>
        )}
        
        {isLoading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
          </div>
        )}
      </div>
      
      {error && <div className="upload-error">{error}</div>}
    </div>
  );
};

export default FileUpload; 