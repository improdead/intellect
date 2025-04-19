"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { clientDataService, CreateChatHistoryData, SubjectWithIcon } from "@/lib/data-service";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Chat title must be at least 2 characters.",
  }),
  subject_id: z.string().optional(),
});

interface ChatFormProps {
  userId: string;
  subjects: SubjectWithIcon[];
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
}

export function ChatForm({ userId, subjects, onSuccess, onCancel }: ChatFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      subject_id: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const chatData: CreateChatHistoryData = {
        user_id: userId,
        title: values.title,
        subject_id: values.subject_id,
      };

      const result = await clientDataService.createChatHistory(chatData);
      
      if (result) {
        toast.success("Chat created successfully!");
        if (onSuccess) onSuccess(result);
        form.reset();
      } else {
        toast.error("Failed to create chat. Please try again.");
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("An error occurred while creating the chat.");
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
        <h3 className="text-lg font-medium">Start New Chat</h3>
        <p className="text-sm text-muted-foreground">
          Begin a new conversation with the AI tutor.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chat Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Quantum Physics Discussion" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subject_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject (Optional)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name || subject.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

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
                  Creating...
                </>
              ) : (
                "Start Chat"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
}
