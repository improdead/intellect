"use client";

import React, { useState, useRef } from "react";
import { toast } from "sonner";
import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Accepted file types
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/x-pdf'
];

// Ensure we only accept PDF files
const ACCEPTED_EXTENSIONS = ['.pdf'];

interface PdfUploaderProps {
  onUploadComplete: (file: File) => void;
  isUploading?: boolean;
}

export function PdfUploader({ onUploadComplete, isUploading = false }: PdfUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  // File input reference
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];

      // Get file extension
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();

      // Validate file type
      if (!ACCEPTED_FILE_TYPES.includes(selectedFile.type) &&
          !fileExt || !ACCEPTED_EXTENSIONS.includes(`.${fileExt}`)) {
        toast.error("Only PDF files are accepted.");
        setError("Only PDF files are accepted.");
        return;
      }

      // Validate file size
      if (selectedFile.size > MAX_FILE_SIZE) {
        toast.error("File size should be less than 10MB.");
        setError("File size should be less than 10MB.");
        return;
      }

      setFile(selectedFile);
      setError(null);
      toast.success(`File "${selectedFile.name}" selected successfully!`);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-primary', 'bg-primary/5');

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];

      // Get file extension
      const fileExt = droppedFile.name.split('.').pop()?.toLowerCase();

      // Validate file type
      if (!ACCEPTED_FILE_TYPES.includes(droppedFile.type) &&
          !fileExt || !ACCEPTED_EXTENSIONS.includes(`.${fileExt}`)) {
        toast.error("Only PDF files are accepted.");
        setError("Only PDF files are accepted.");
        return;
      }

      // Validate file size
      if (droppedFile.size > MAX_FILE_SIZE) {
        toast.error("File size should be less than 10MB.");
        setError("File size should be less than 10MB.");
        return;
      }

      setFile(droppedFile);
      setError(null);
      toast.success(`File "${droppedFile.name}" selected successfully!`);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('border-primary', 'bg-primary/5');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
  };

  const handleUpload = () => {
    if (!file) {
      toast.error("Please select a file first");
      setError("Please select a file first");
      return;
    }

    // Validate file again before upload
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size should be less than 10MB");
      setError("File size should be less than 10MB");
      return;
    }

    // Get file extension
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !ACCEPTED_EXTENSIONS.includes(`.${fileExt}`)) {
      toast.error("Only PDF files are accepted");
      setError("Only PDF files are accepted");
      return;
    }

    // Log the file details
    console.log(`Uploading file: ${file.name}, Size: ${file.size} bytes, Type: ${file.type}`);

    // Pass the file to the parent component
    onUploadComplete(file);
  };

  const resetUploader = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-xl font-medium">Upload PDF for Quiz</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
          Upload a PDF document to generate quiz questions based on its content.
          The system will extract text and use AI to create relevant questions.
        </p>
      </div>

      {!file ? (
        <div
          className="border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-all duration-300 hover:bg-primary/5"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="bg-primary/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">Upload PDF</h3>
          <p className="text-sm text-muted-foreground text-center mb-2">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-muted-foreground text-center mb-1">
            PDF only (max 10MB)
          </p>
          <p className="text-xs text-muted-foreground text-center italic">
            PDFs must contain selectable text, not just scanned images
          </p>
          <input
            type="file"
            className="hidden"
            accept=".pdf,application/pdf,application/x-pdf"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/5 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary/10 rounded-full">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium truncate max-w-[200px]">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetUploader}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              disabled={isUploading}
            >
              Remove
            </Button>
          </div>

          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full py-6"
            size="lg"
          >
            {isUploading ? "Generating Quiz..." : "Generate Quiz"}
          </Button>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Processing PDF...</span>
                <span>Please wait</span>
              </div>
              <Progress value={undefined} className="h-2" />
            </div>
          )}

          {error && (
            <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-md">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
