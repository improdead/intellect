"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { SimpleDocumentUploadForm } from "@/components/forms/simple-document-upload-form";
import { DocumentUploadButton } from "@/components/document-upload-button";
import { DirectFileInput } from "@/components/direct-file-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(0);

  const handleFileSelected = (file: File, count: number) => {
    setSelectedFile(file);
    setQuestionCount(count);
    toast.success(`File "${file.name}" selected with ${count} questions`);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Document Upload Test Page</h1>
      <p className="text-muted-foreground">
        This page is for testing document upload functionality.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Simple Document Upload Form</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleDocumentUploadForm
              onSuccess={({ file, questionCount }) => {
                handleFileSelected(file, questionCount);
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Document Upload Button</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p>Click the button below to upload a document:</p>

            <DocumentUploadButton
              onFileSelected={handleFileSelected}
              buttonText="Upload Document"
              className="w-full"
            />

            {selectedFile && (
              <div className="mt-4 p-4 border rounded-md">
                <h3 className="font-medium mb-2">Selected File:</h3>
                <p><strong>Name:</strong> {selectedFile.name}</p>
                <p><strong>Type:</strong> {selectedFile.type}</p>
                <p><strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                <p><strong>Question Count:</strong> {questionCount}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Direct File Input</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p>Simple direct file input component:</p>

            <DirectFileInput
              onFileSelected={(file) => {
                setSelectedFile(file);
                setQuestionCount(10); // Default to 10 questions
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
