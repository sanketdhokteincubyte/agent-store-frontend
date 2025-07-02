import React, { useCallback, useState, useEffect } from 'react';
import { Upload, X, File, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SUPPORTED_FILE_TYPES, type FileUploadInfo } from '@/types';

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  disabled?: boolean;
  className?: string;
  compact?: boolean; // New prop for compact mode
  value?: File[]; // Controlled component support
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesChange,
  maxFiles = 10,
  maxFileSize = 50 * 1024 * 1024, // 50MB default
  disabled = false,
  className = '',
  compact = false,
  value = [],
}) => {
  const [files, setFiles] = useState<FileUploadInfo[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync internal state with external value prop
  useEffect(() => {
    if (value.length === 0 && files.length > 0) {
      // Clear internal files when external value is cleared
      setFiles([]);
      setError(null);
    }
  }, [value, files.length]);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      return `File "${file.name}" is too large. Maximum size is ${Math.round(maxFileSize / (1024 * 1024))}MB.`;
    }

    // Check file type
    const isSupported = Object.keys(SUPPORTED_FILE_TYPES).some(mimeType => 
      file.type === mimeType || 
      SUPPORTED_FILE_TYPES[mimeType as keyof typeof SUPPORTED_FILE_TYPES].some(ext => 
        file.name.toLowerCase().endsWith(ext)
      )
    );

    if (!isSupported) {
      return `File type "${file.type || 'unknown'}" is not supported.`;
    }

    return null;
  };

  const addFiles = useCallback((newFiles: File[]) => {
    setError(null);
    
    // Validate each file
    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    for (const file of newFiles) {
      const error = validateFile(file);
      if (error) {
        validationErrors.push(error);
      } else {
        validFiles.push(file);
      }
    }

    // Check total file count
    const totalFiles = files.length + validFiles.length;
    if (totalFiles > maxFiles) {
      validationErrors.push(`Cannot upload more than ${maxFiles} files.`);
      return;
    }

    if (validationErrors.length > 0) {
      setError(validationErrors.join(' '));
      return;
    }

    // Create file info objects
    const newFileInfos: FileUploadInfo[] = validFiles.map(file => ({
      file,
      id: `${file.name}-${file.size}-${Date.now()}`,
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    const updatedFiles = [...files, ...newFileInfos];
    setFiles(updatedFiles);
    onFilesChange(updatedFiles.map(f => f.file));
  }, [files, maxFiles, maxFileSize, onFilesChange]);

  const removeFile = useCallback((fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles.map(f => f.file));
  }, [files, onFilesChange]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, [addFiles, disabled]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
    
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [addFiles, disabled]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSupportedFormats = (): string => {
    const extensions = Object.values(SUPPORTED_FILE_TYPES).flat();
    return extensions.join(', ');
  };

  if (compact) {
    return (
      <div className={`${className}`}>
        {/* Compact Upload Button */}
        <div className="flex items-center gap-2">
          <label htmlFor="file-upload-compact" className={disabled ? 'cursor-not-allowed' : 'cursor-pointer'}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              className="h-8 w-8 p-0 hover:bg-gray-100"
              asChild
            >
              <span>
                <Upload className="h-4 w-4" />
              </span>
            </Button>
            <input
              id="file-upload-compact"
              type="file"
              multiple
              disabled={disabled}
              onChange={handleFileInput}
              className="sr-only"
              accept={Object.keys(SUPPORTED_FILE_TYPES).join(',')}
            />
          </label>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}


      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          dragActive
            ? 'border-primary bg-primary/5'
            : disabled
            ? 'border-gray-200 bg-gray-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="p-6">
          <div className="text-center">
            <Upload className={`mx-auto h-12 w-12 ${disabled ? 'text-gray-300' : 'text-gray-400'}`} />
            <div className="mt-4">
              <label htmlFor="file-upload" className={disabled ? 'cursor-not-allowed' : 'cursor-pointer'}>
                <span className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-primary hover:text-primary/80'}`}>
                  Click to upload files
                </span>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  disabled={disabled}
                  onChange={handleFileInput}
                  className="sr-only"
                  accept={Object.keys(SUPPORTED_FILE_TYPES).join(',')}
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Supported formats: {getSupportedFormats()}
            </p>
            <p className="text-xs text-gray-500">
              Max {maxFiles} files, {Math.round(maxFileSize / (1024 * 1024))}MB each
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Selected Files ({files.length}/{maxFiles})
          </h4>
          <div className="space-y-2">
            {files.map((fileInfo) => (
              <div
                key={fileInfo.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center space-x-3">
                  <File className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{fileInfo.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(fileInfo.size)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(fileInfo.id)}
                  disabled={disabled}
                  className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
