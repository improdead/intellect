"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Upload, Folder, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/x-pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

interface FolderUploadButtonProps {
  onFolderProcessed?: (files: File[], questionCount: number) => void;
  className?: string;
  buttonText?: string;
}

export function FolderUploadButton({
  onFolderProcessed,
  className = "",
  buttonText = "Import Folder"
}: FolderUploadButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [validFiles, setValidFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFolderChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      toast.error("No files selected");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    
    // Filter valid files (PDF and Word documents)
    const validFilesList: File[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Update progress
      setProgress(Math.round((i / files.length) * 100));
      
      // Check file type
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        console.log(`Skipping file ${file.name}: unsupported type ${file.type}`);
        continue;
      }
      
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        console.log(`Skipping file ${file.name}: too large (${file.size} bytes)`);
        continue;
      }
      
      validFilesList.push(file);
    }
    
    setValidFiles(validFilesList);
    setProgress(100);
    
    if (validFilesList.length === 0) {
      toast.error("No valid PDF or Word documents found in the selected folder");
      setIsProcessing(false);
      return;
    }
    
    toast.success(`Found ${validFilesList.length} valid documents in the folder`);
    
    if (onFolderProcessed) {
      onFolderProcessed(validFilesList, 20); // Default to 20 questions max
    }
    
    setIsProcessing(false);
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={() => fileInputRef.current?.click()}
        className={`flex items-center gap-2 ${className}`}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Folder className="h-5 w-5" />
        )}
        <span>{buttonText}</span>
      </Button>

      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFolderChange}
        webkitdirectory="true"
        directory=""
        multiple
      />

      {isProcessing && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Processing folder...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
    </div>
  );
}
