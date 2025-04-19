"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Loader2, Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/x-pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

interface SimpleDocumentUploadFormProps {
  onSuccess?: (data: { file: File; questionCount: number }) => void;
  onCancel?: () => void;
}

export function SimpleDocumentUploadForm({ onSuccess, onCancel }: SimpleDocumentUploadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [questionCount, setQuestionCount] = useState(10);

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
      toast.success(`File "${file.name}" selected successfully!`);
    } else {
      setSelectedFile(null);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (onSuccess) {
        console.log("Submitting file:", {
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
          questionCount
        });
        
        onSuccess({
          file: selectedFile,
          questionCount
        });
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("An error occurred while uploading the document.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Upload Document for Quiz</h3>
        <p className="text-sm text-muted-foreground">
          Upload a document to generate quiz questions based on its content.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Document</label>
          <div className="space-y-4">
            {!selectedFile ? (
              <div
                className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground text-center">
                  Click to upload or drag and drop<br />
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
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded">
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
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Number of Questions: {questionCount}</label>
          <input 
            type="range" 
            min="1" 
            max="20" 
            value={questionCount}
            onChange={(e) => setQuestionCount(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1</span>
            <span>20</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting || !selectedFile}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Generate Quiz"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
