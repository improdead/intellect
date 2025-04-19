"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, Upload, File, X, FileText } from "lucide-react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/x-pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

const formSchema = z.object({
  document: z
    .any()
    .refine((files) => files && files.length > 0, {
      message: "Please upload a document.",
    })
    .refine((files) => files && files[0] && files[0].size <= MAX_FILE_SIZE, {
      message: `File size should be less than 10MB.`,
    })
    .refine(
      (files) => files && files[0] && ACCEPTED_FILE_TYPES.includes(files[0].type),
      {
        message: "Only PDF, TXT, and DOCX files are accepted.",
      }
    ),
  questionCount: z.number().min(1).max(20),
});

interface DocumentUploadFormProps {
  onSuccess?: (data: { file: File; questionCount: number }) => void;
  onCancel?: () => void;
  debug?: boolean;
}

export function DocumentUploadForm({ onSuccess, onCancel, debug = false }: DocumentUploadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      questionCount: 10,
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    form.setValue("document", undefined as any);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      if (!selectedFile) {
        toast.error("Please select a file to upload");
        return;
      }

      // Double-check file type and size
      if (!ACCEPTED_FILE_TYPES.includes(selectedFile.type)) {
        toast.error("Only PDF, TXT, and DOCX files are accepted.");
        return;
      }

      if (selectedFile.size > MAX_FILE_SIZE) {
        toast.error("File size should be less than 10MB.");
        return;
      }

      if (onSuccess) {
        console.log("Submitting file:", {
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
          questionCount: values.questionCount
        });

        onSuccess({
          file: selectedFile,
          questionCount: values.questionCount,
        });
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("An error occurred while uploading the document.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-medium">Upload Document for Quiz</h3>
        <p className="text-sm text-muted-foreground">
          Upload a document to generate quiz questions based on its content.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="document"
            render={({ field: { onChange, value, ...rest } }) => (
              <FormItem>
                <FormLabel>Document</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    {!selectedFile ? (
                      <div
                        className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.currentTarget.classList.add('border-primary');
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.currentTarget.classList.remove('border-primary');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.currentTarget.classList.remove('border-primary');

                          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                            const file = e.dataTransfer.files[0];
                            // Check file type
                            if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
                              toast.error('Only PDF, TXT, and DOCX files are accepted.');
                              return;
                            }
                            // Check file size
                            if (file.size > MAX_FILE_SIZE) {
                              toast.error('File size should be less than 10MB.');
                              return;
                            }

                            setSelectedFile(file);
                            if (fileInputRef.current) {
                              const dataTransfer = new DataTransfer();
                              dataTransfer.items.add(file);
                              fileInputRef.current.files = dataTransfer.files;
                              form.setValue('document', dataTransfer.files);
                            }
                          }
                        }}
                      >
                        <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground text-center">
                          Click to upload or drag and drop<br />
                          PDF, TXT, or DOCX (max 10MB)
                        </p>
                        <Input
                          type="file"
                          className="hidden"
                          accept=".pdf,.txt,.docx"
                          ref={fileInputRef}
                          onChange={(e) => {
                            handleFileChange(e);
                            onChange(e.target.files);
                          }}
                          {...rest}
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
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="questionCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Questions (1-20)</FormLabel>
                <div className="space-y-2">
                  <Slider
                    min={1}
                    max={20}
                    step={1}
                    defaultValue={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1</span>
                    <span>{field.value}</span>
                    <span>20</span>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {debug && selectedFile && (
            <div className="mt-4 p-4 border rounded bg-gray-50 text-xs font-mono">
              <div><strong>File Name:</strong> {selectedFile.name}</div>
              <div><strong>File Type:</strong> {selectedFile.type}</div>
              <div><strong>File Size:</strong> {selectedFile.size} bytes ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</div>
              <div><strong>Last Modified:</strong> {new Date(selectedFile.lastModified).toLocaleString()}</div>
              <div><strong>Accepted Types:</strong> {ACCEPTED_FILE_TYPES.join(', ')}</div>
              <div><strong>Type Accepted:</strong> {ACCEPTED_FILE_TYPES.includes(selectedFile.type) ? 'Yes' : 'No'}</div>
              <div><strong>Size Accepted:</strong> {selectedFile.size <= MAX_FILE_SIZE ? 'Yes' : 'No'}</div>
            </div>
          )}

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
            <Button type="submit" disabled={isSubmitting}>
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
      </Form>
    </motion.div>
  );
}
