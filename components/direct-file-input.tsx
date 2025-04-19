"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/x-pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

interface DirectFileInputProps {
  onFileSelected?: (file: File) => void;
  className?: string;
}

export function DirectFileInput({ onFileSelected, className = "" }: DirectFileInputProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Validate file type
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        toast.error("Only PDF, TXT, and DOCX files are accepted.");
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error("File size should be less than 10MB.");
        return;
      }

      setSelectedFile(file);

      if (onFileSelected) {
        onFileSelected(file);
      }

      toast.success(`File "${file.name}" selected successfully!`);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {!selectedFile ? (
        <div
          className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-all duration-300 hover:bg-primary/5"
          onClick={handleUploadClick}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.classList.add('border-primary', 'bg-primary/5');
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.classList.remove('border-primary', 'bg-primary/5');

            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              const file = e.dataTransfer.files[0];

              // Validate file type
              if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
                toast.error("Only PDF, TXT, and DOCX files are accepted.");
                return;
              }

              // Validate file size
              if (file.size > MAX_FILE_SIZE) {
                toast.error("File size should be less than 10MB.");
                return;
              }

              setSelectedFile(file);

              if (onFileSelected) {
                onFileSelected(file);
              }

              toast.success(`File "${file.name}" selected successfully!`);
            }
          }}
        >
          <div className="bg-primary/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">Upload Document</h3>
          <p className="text-sm text-muted-foreground text-center mb-2">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-muted-foreground text-center">
            PDF, TXT, or DOCX (max 10MB)
          </p>
          <input
            type="file"
            className="hidden"
            accept=".pdf,.txt,.docx"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/5 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium truncate max-w-[200px]">
                {selectedFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clearSelectedFile}
            className="rounded-full hover:bg-primary/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
