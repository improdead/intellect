"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateModal } from "@/components/ui/create-modal";
import { SimpleDocumentUploadForm } from "@/components/forms/simple-document-upload-form";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/x-pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

interface DocumentUploadButtonProps {
  onFileSelected?: (file: File, questionCount: number) => void;
  className?: string;
  buttonText?: string;
}

export function DocumentUploadButton({
  onFileSelected,
  className = "",
  buttonText = "Import Document"
}: DocumentUploadButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input change event triggered');
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      console.log('File selected:', file.name, file.type, file.size);

      // Validate file type
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        console.log('File type not accepted:', file.type);
        toast.error("Only PDF, TXT, and DOCX files are accepted.");
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        console.log('File too large:', file.size);
        toast.error("File size should be less than 10MB.");
        return;
      }

      console.log('File validation passed, calling onFileSelected callback');
      if (onFileSelected) {
        onFileSelected(file, 10); // Default to 10 questions
      }

      toast.success(`File "${file.name}" selected successfully!`);
    } else {
      console.log('No files selected');
    }
  };

  const handleUploadSuccess = ({ file, questionCount }: { file: File; questionCount: number }) => {
    if (onFileSelected) {
      onFileSelected(file, questionCount);
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center gap-2 ${className}`}
      >
        <Upload className="h-5 w-5" />
        <span>{buttonText}</span>
      </Button>

      <input
        type="file"
        className="hidden"
        accept=".pdf,.txt,.docx"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <CreateModal
        title="Generate Quiz from Document"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <SimpleDocumentUploadForm
          onSuccess={handleUploadSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </CreateModal>
    </>
  );
}
