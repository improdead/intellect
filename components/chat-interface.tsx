"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import styled from "@emotion/styled";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Send,
  Brain,
  User,
  Video,
  Zap,
  Sparkles,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
import { BookLoader } from "./book-loader";

// Helper function to generate unique IDs
const generateUniqueId = () =>
  `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

// Styled component for grid pattern background
const GridBackground = styled.div`
  background-size: 20px 20px;
  background-image: linear-gradient(
      to right,
      rgba(70, 69, 246, 0.05) 1px,
      transparent 1px
    ),
    linear-gradient(to bottom, rgba(70, 69, 246, 0.05) 1px, transparent 1px);
`;

// Sample chat messages for demonstration
const defaultMessages: ChatMessage[] = [
  {
    id: generateUniqueId(),
    role: "assistant",
    content: "Hi there! I'm your AI assistant. How can I help you today?",
    timestamp: "18:49",
    isNewGroup: true,
    dateMarker: "Today",
  },
];

interface ChatInterfaceProps {
  initialMessage?: string | null;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isNewGroup?: boolean;
  dateMarker?: string;
  svgData?: string; // SVG content to display
  svgHidden?: boolean; // Flag to indicate if SVG is hidden by user
  svgGenerating?: boolean; // Flag to indicate if SVG is currently being generated
}

export default function ChatInterface({ initialMessage }: ChatInterfaceProps) {
  // Apply markdown styles
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      .markdown-content h1 { font-size: 1.5rem; font-weight: 600; margin-top: 1rem; margin-bottom: 0.5rem; }
      .markdown-content h2 { font-size: 1.25rem; font-weight: 600; margin-top: 0.75rem; margin-bottom: 0.5rem; }
      .markdown-content h3 { font-size: 1.125rem; font-weight: 600; margin-top: 0.75rem; margin-bottom: 0.5rem; }
      .markdown-content p { margin-bottom: 0.75rem; }
      .markdown-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 0.75rem; }
      .markdown-content ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 0.75rem; }
      .markdown-content li { margin-bottom: 0.25rem; }
      .markdown-content pre { background-color: rgba(0, 0, 0, 0.05); padding: 0.75rem; border-radius: 0.375rem; overflow-x: auto; margin: 0.75rem 0; }
      .markdown-content code { font-family: monospace; background-color: rgba(0, 0, 0, 0.05); padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-size: 0.875rem; }
      .markdown-content blockquote { border-left: 4px solid rgba(70, 69, 246, 0.3); padding-left: 0.75rem; font-style: italic; margin: 0.75rem 0; }
      .markdown-content a { color: #4645F6; text-decoration: none; }
      .markdown-content a:hover { text-decoration: underline; }
      .markdown-content table { width: 100%; border-collapse: collapse; margin: 0.75rem 0; }
      .markdown-content th, .markdown-content td { border: 1px solid rgba(0, 0, 0, 0.1); padding: 0.5rem; text-align: left; }
      .markdown-content th { background-color: rgba(0, 0, 0, 0.05); }
      .markdown-content img { max-width: 100%; height: auto; border-radius: 0.375rem; margin: 0.75rem 0; }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  const [messages, setMessages] = useState<ChatMessage[]>(defaultMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    { role: "user" | "model"; parts: { text: string }[]; svgData?: string }[]
  >([]);
  const [showDeepDive, setShowDeepDive] = useState(false);
  const [deepDiveEnabled, setDeepDiveEnabled] = useState(false);
  const [isFirstMessage, setIsFirstMessage] = useState(messages.length <= 1);
  const [generatingStatus, setGeneratingStatus] = useState("");
  const [forceSVG, setForceSVG] = useState(false);
  // We don't need the isSvgLoading state anymore as we're using message.svgGenerating
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // We no longer need API wrapper functions as we're making direct API calls

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Function to format AI response as a single message
  const splitIntoMultipleMessages = (content: string): string[] => {
    // Clean up any excessive formatting like **** or multiple asterisks
    let cleanedContent = content
      .replace(/\*{2,}/g, "") // Remove multiple asterisks
      .replace(/\*\s*\*\s*\*/g, "") // Remove patterns like * * *
      .trim();

    // Return as a single message instead of splitting by paragraphs
    return [cleanedContent];
  };

  // Helper function to get the most recent SVG from chat history
  const getPreviousSVG = (
    history: {
      role: "user" | "model";
      parts: { text: string }[];
      svgData?: string;
    }[]
  ): string | undefined => {
    // Look for the most recent model message with SVG data
    for (let i = history.length - 1; i >= 0; i--) {
      const message = history[i];
      if (message.role === "model" && message.svgData) {
        return message.svgData;
      }
    }
    return undefined;
  };

  // Track processed initial messages to prevent duplicates
  const processedInitialMessageRef = useRef<string | null>(null);

  // Process initial message if provided
  useEffect(() => {
    if (
      initialMessage &&
      initialMessage !== processedInitialMessageRef.current
    ) {
      // Mark this message as processed
      processedInitialMessageRef.current = initialMessage;

      // Add a slight delay to create a smooth transition effect
      setTimeout(() => {
        // Simulate user sending the initial message
        const userMessage: ChatMessage = {
          id: generateUniqueId(),
          role: "user",
          content: initialMessage,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isNewGroup: true,
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsTyping(true);

        // Set loading state
        setGeneratingStatus("Thinking...");
      }, 300); // Short delay for transition effect

      // Call the text generation API after a short delay to allow for the UI transition
      setTimeout(async () => {
        try {
          // First, get just the text response quickly
          const textResponse = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: initialMessage,
              history: chatHistory,
              useThinkingModel: false, // Normal mode for initial message
              generateSVG: false, // Don't generate SVG yet for faster text response
              isFollowUp: false, // First message
              forceSVG: forceSVG, // User explicitly requested SVG
            }),
          });

          if (!textResponse.ok) {
            throw new Error(
              `API call failed with status: ${textResponse.status}`
            );
          }

          const textData = await textResponse.json();

          // Update chat history for future API calls
          setChatHistory((prev) => [
            ...prev,
            { role: "user" as const, parts: [{ text: initialMessage }] },
            {
              role: "model" as const,
              parts: [{ text: textData.responseText }],
            },
          ]);

          // Split the response into multiple messages
          const responseMessages = splitIntoMultipleMessages(
            textData.responseText
          );

          // Check if the response contains the SVG recommendation marker
          const svgNeededMatch = textData.responseText.match(
            /\[SVG_NEEDED:\s*(true|false)\]/i
          );
          const aiRecommendsSVG =
            svgNeededMatch && svgNeededMatch[1].toLowerCase() === "true";

          // Create the AI message without SVG data first
          const aiMessage: ChatMessage = {
            id: generateUniqueId(),
            role: "assistant",
            content: responseMessages[0], // Just use the first message for now
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            svgData: undefined, // No SVG data yet
            svgGenerating: aiRecommendsSVG || forceSVG, // Only show loading if SVG is needed
          };

          console.log(
            "AI recommends SVG:",
            aiRecommendsSVG,
            "Force SVG:",
            forceSVG
          );

          // Add the message to the chat
          setMessages((prev) => [...prev, aiMessage]);
          setIsTyping(false);

          // Only generate SVG if AI recommends it or user forces it
          if (aiRecommendsSVG || forceSVG) {
            // Wait a moment for the text to be visible before starting SVG generation
            setTimeout(() => {
              try {
                // Update the status message
                setGeneratingStatus("Generating visualization...");

                // Now get the SVG in a non-blocking way
                fetch("/api/svg", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    prompt: initialMessage,
                    previousSVG: getPreviousSVG(chatHistory),
                  }),
                })
                  .then((response) => {
                    if (response.ok) {
                      return response.json();
                    }
                    throw new Error("SVG generation failed");
                  })
                  .then((svgResult) => {
                    // Update the message with SVG data
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === aiMessage.id
                          ? {
                              ...msg,
                              svgData: svgResult.svgData,
                              svgGenerating: false, // Turn off loading animation
                            }
                          : msg
                      )
                    );

                    // Also update the chat history with the SVG data
                    setChatHistory((prev) => {
                      const lastIndex = prev.length - 1;
                      if (lastIndex >= 0 && prev[lastIndex].role === "model") {
                        const updatedHistory = [...prev];
                        updatedHistory[lastIndex] = {
                          ...updatedHistory[lastIndex],
                          svgData: svgResult.svgData,
                        };
                        return updatedHistory;
                      }
                      return prev;
                    });
                    console.log("SVG generation complete");
                  })
                  .catch((svgError) => {
                    console.error("Error generating SVG:", svgError);
                    // Update the message to remove the loading animation
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === aiMessage.id
                          ? { ...msg, svgGenerating: false }
                          : msg
                      )
                    );
                  })
                  .finally(() => {
                    setGeneratingStatus("");
                  });
              } catch (svgError) {
                console.error("Error generating SVG:", svgError);
              }
            }, 1000); // Wait 1 second after text appears before starting SVG generation
          }
        } catch (error) {
          console.error("Error processing AI response:", error);
          // Add error message to chat
          const errorMessage: ChatMessage = {
            id: generateUniqueId(),
            role: "assistant",
            content:
              "Sorry, I encountered an error while processing your request. Please try again.",
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
          setMessages((prev) => [...prev, errorMessage]);
          setIsTyping(false);
        }
      }, 1000);
    }
  }, [initialMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Removed sidebar auto-hide effect as SVGs are now displayed in the chat

  // Persist chat history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatHistory", JSON.stringify(messages));
    }
  }, [messages]);

  // Load chat history from localStorage on initial load
  useEffect(() => {
    const savedHistory = localStorage.getItem("chatHistory");
    if (savedHistory && messages.length === 0) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setMessages(parsedHistory);

        // Also update the chatHistory state for API calls
        const apiHistory: {
          role: "user" | "model";
          parts: { text: string }[];
          svgData?: string;
        }[] = [];
        for (let i = 0; i < parsedHistory.length; i++) {
          const msg = parsedHistory[i];
          if (msg.role === "user") {
            apiHistory.push({ role: "user", parts: [{ text: msg.content }] });
          } else if (msg.role === "assistant") {
            apiHistory.push({
              role: "model",
              parts: [{ text: msg.content }],
              svgData: msg.svgData,
            });
          }
        }
        setChatHistory(apiHistory);
      } catch (error) {
        console.error("Error loading chat history:", error);
        localStorage.removeItem("chatHistory");
      }
    }
  }, []);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Store the input for later use with SVG generation
    const currentInput = input;

    // Add user message
    const userMessage: ChatMessage = {
      id: generateUniqueId(),
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isNewGroup:
        messages.length > 0 &&
        messages[messages.length - 1].role !== "user" &&
        new Date().getTime() -
          new Date().setHours(
            parseInt(messages[messages.length - 1].timestamp.split(":")[0]),
            parseInt(messages[messages.length - 1].timestamp.split(":")[1])
          ) >
          5 * 60 * 1000, // 5 minutes difference
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setShowDeepDive(false);
    // Don't reset forceSVG here to maintain user preference
    setGeneratingStatus(
      deepDiveEnabled ? "Generating deep dive response..." : "Thinking..."
    );

    // Call the text generation API immediately
    setTimeout(async () => {
      try {
        // First, get just the text response quickly
        const textResponse = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: currentInput,
            history: chatHistory,
            useThinkingModel: deepDiveEnabled, // Use Gemini 2.5 Pro for Deep Dive
            generateSVG: false, // Don't generate SVG yet for faster text response
            isFollowUp: !isFirstMessage, // Indicate if this is a follow-up message
            forceSVG: forceSVG, // User explicitly requested SVG
          }),
        });

        if (!textResponse.ok) {
          throw new Error(
            `API call failed with status: ${textResponse.status}`
          );
        }

        const textData = await textResponse.json();

        // Update chat history for future API calls - we'll add the SVG data later
        setChatHistory([
          ...chatHistory,
          { role: "user" as const, parts: [{ text: currentInput }] },
          { role: "model" as const, parts: [{ text: textData.responseText }] },
        ]);

        // No longer first message after this
        setIsFirstMessage(false);
        // Reset Deep Dive toggle
        setDeepDiveEnabled(false);
        // Don't reset forceSVG to maintain user preference

        // Split the response into multiple messages
        const responseMessages = splitIntoMultipleMessages(
          textData.responseText
        );

        // Check if the response contains the SVG recommendation marker
        const svgNeededMatch = textData.responseText.match(
          /\[SVG_NEEDED:\s*(true|false)\]/i
        );
        const aiRecommendsSVG =
          svgNeededMatch && svgNeededMatch[1].toLowerCase() === "true";

        console.log(
          "AI recommends SVG:",
          aiRecommendsSVG,
          "Force SVG:",
          forceSVG
        );

        // Create the AI message without SVG data first
        const aiMessage: ChatMessage = {
          id: generateUniqueId(),
          role: "assistant",
          content: responseMessages[0], // Just use the first message for now
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          svgData: undefined, // No SVG data yet
          svgGenerating: aiRecommendsSVG || forceSVG, // Only show loading if SVG is needed
        };

        // Add the message to the chat
        setMessages((prev) => [...prev, aiMessage]);
        setIsTyping(false);

        // Only generate SVG if AI recommends it or user forces it
        if (aiRecommendsSVG || forceSVG) {
          // Delay SVG generation to ensure text is visible first
          setTimeout(() => {
            try {
              // Update the status message
              setGeneratingStatus("Generating visualization...");

              // Now get the SVG in a non-blocking way
              fetch("/api/svg", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  prompt: currentInput,
                  previousSVG: getPreviousSVG(chatHistory),
                }),
              })
                .then((response) => {
                  if (response.ok) {
                    return response.json();
                  }
                  throw new Error("SVG generation failed");
                })
                .then((svgResult) => {
                  // Update the message with SVG data
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === aiMessage.id
                        ? {
                            ...msg,
                            svgData: svgResult.svgData,
                            svgGenerating: false,
                          }
                        : msg
                    )
                  );

                  // Also update the chat history with the SVG data
                  setChatHistory((prev) => {
                    const lastIndex = prev.length - 1;
                    if (lastIndex >= 0 && prev[lastIndex].role === "model") {
                      const updatedHistory = [...prev];
                      updatedHistory[lastIndex] = {
                        ...updatedHistory[lastIndex],
                        svgData: svgResult.svgData,
                      };
                      return updatedHistory;
                    }
                    return prev;
                  });
                  console.log("SVG generation complete");
                })
                .catch((svgError) => {
                  console.error("Error generating SVG:", svgError);
                })
                .finally(() => {
                  setGeneratingStatus("");
                });
            } catch (svgError) {
              console.error("Error generating SVG:", svgError);
              // Update the message to remove the loading animation
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiMessage.id
                    ? { ...msg, svgGenerating: false }
                    : msg
                )
              );
            }
          }, 1200); // Wait 1.2 seconds after text appears before starting SVG generation
        }
      } catch (error) {
        console.error("Error processing AI response:", error);
        // Add error message to chat
        const errorMessage: ChatMessage = {
          id: generateUniqueId(),
          role: "assistant",
          content:
            "Sorry, I encountered an error while processing your request. Please try again.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsTyping(false);
      }
    }, 1200); // Increased delay to ensure UI transition completes first
  };

  return (
    <Card className="h-full border-0 rounded-none shadow-none bg-background text-foreground overflow-hidden">
      {/* Main chat area */}
      <div className="flex flex-col h-full">
        <CardHeader className="border-b border-border px-6 py-3 bg-background shadow-sm">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarImage src="/metallic-gaze.png" />
                  <AvatarFallback className="bg-primary/10">
                    <Brain className="h-5 w-5 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <motion.div
                  className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div>
                <CardTitle className="text-base font-medium">
                  Intelect AI
                </CardTitle>
                <p className="text-xs text-muted-foreground">Active now</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-9 w-9"
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to clear the chat history?"
                    )
                  ) {
                    localStorage.removeItem("chatHistory");
                    setMessages([]);
                    setChatHistory([]);
                    setIsFirstMessage(true);
                  }
                }}
                title="Clear chat history"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-9 w-9"
              >
                <Video className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="space-y-4 max-w-3xl mx-auto">
            <AnimatePresence initial={false}>
              {messages.map((message, index) => (
                <React.Fragment key={message.id}>
                  {/* Date marker */}
                  {message.dateMarker && (
                    <div className="flex justify-center my-4">
                      <div className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full">
                        {message.dateMarker}
                      </div>
                    </div>
                  )}

                  {/* Time marker for new message groups */}
                  {message.isNewGroup && !message.dateMarker && (
                    <div className="flex justify-center my-3">
                      <div className="text-muted-foreground text-xs">
                        {new Date().toLocaleString("en-US", {
                          weekday: "short",
                        })}{" "}
                        {message.timestamp}
                      </div>
                    </div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    } ${
                      index > 0 &&
                      messages[index - 1].role === message.role &&
                      !message.isNewGroup
                        ? "mt-1"
                        : "mt-3"
                    }`}
                  >
                    <div
                      className={`flex items-start gap-2 ${
                        message.role === "assistant"
                          ? "max-w-[90%]"
                          : "max-w-[80%]"
                      }`}
                    >
                      {/* AI Avatar - only show for first message in a group */}
                      {message.role === "assistant" &&
                        (index === 0 ||
                          messages[index - 1].role !== "assistant" ||
                          message.isNewGroup) && (
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarImage src="/metallic-gaze.png" />
                            <AvatarFallback className="bg-primary/10">
                              <Brain className="h-4 w-4 text-primary" />
                            </AvatarFallback>
                          </Avatar>
                        )}

                      {/* Spacer for consecutive AI messages */}
                      {message.role === "assistant" &&
                        index > 0 &&
                        messages[index - 1].role === "assistant" &&
                        !message.isNewGroup && <div className="w-8"></div>}

                      <div
                        className={`${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm p-3"
                            : "bg-secondary text-secondary-foreground rounded-2xl rounded-tl-sm p-4"
                        } ${
                          index > 0 &&
                          messages[index - 1].role === message.role &&
                          !message.isNewGroup
                            ? message.role === "user"
                              ? "rounded-tr-2xl"
                              : "rounded-tl-2xl"
                            : ""
                        }`}
                      >
                        <div>
                          {message.role === "assistant" ? (
                            <div className="markdown-content text-sm leading-relaxed">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                              >
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <p className="text-sm">{message.content}</p>
                          )}

                          {/* Display SVG or loading animation */}
                          {message.role === "assistant" &&
                            (message.svgData || message.svgGenerating) && (
                              <div className="mt-4 rounded-lg overflow-hidden border border-border shadow-md max-w-full">
                                <div className="p-2 bg-muted/30 border-b border-border flex justify-between items-center">
                                  <h3 className="text-xs font-medium">
                                    {message.svgGenerating
                                      ? "Generating Visualization"
                                      : "Visualization"}
                                  </h3>
                                  {message.svgGenerating ? (
                                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 rounded-full"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Update the message to hide the SVG
                                        setMessages((prev) =>
                                          prev.map((msg) =>
                                            msg.id === message.id
                                              ? {
                                                  ...msg,
                                                  svgData: undefined,
                                                  svgHidden: true,
                                                }
                                              : msg
                                          )
                                        );
                                      }}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                                <div className="p-3 flex items-center justify-center bg-white/5">
                                  {message.svgGenerating ? (
                                    <div className="relative w-[400px] h-[300px] bg-muted/30 rounded-lg flex flex-col items-center justify-center overflow-hidden">
                                      {/* Canvas-like grid background */}
                                      <GridBackground className="absolute inset-0 opacity-5" />

                                      {/* Background animation */}
                                      <div className="absolute inset-0 opacity-10">
                                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 to-transparent animate-pulse"></div>
                                        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-primary/10 animate-ping [animation-duration:3s]"></div>
                                        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 rounded-full bg-primary/10 animate-ping [animation-duration:2.5s] [animation-delay:0.5s]"></div>
                                      </div>

                                      {/* SVG elements being drawn animation */}
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <svg
                                          width="200"
                                          height="200"
                                          viewBox="0 0 200 200"
                                          className="opacity-20"
                                        >
                                          <motion.circle
                                            cx="100"
                                            cy="100"
                                            r="50"
                                            stroke="#4645F6"
                                            strokeWidth="2"
                                            fill="none"
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            transition={{
                                              duration: 2,
                                              repeat: Infinity,
                                            }}
                                          />
                                          <motion.rect
                                            x="70"
                                            y="70"
                                            width="60"
                                            height="60"
                                            stroke="#4645F6"
                                            strokeWidth="2"
                                            fill="none"
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            transition={{
                                              duration: 2,
                                              delay: 0.5,
                                              repeat: Infinity,
                                            }}
                                          />
                                          <motion.path
                                            d="M50,150 Q100,50 150,150"
                                            stroke="#4645F6"
                                            strokeWidth="2"
                                            fill="none"
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            transition={{
                                              duration: 2,
                                              delay: 1,
                                              repeat: Infinity,
                                            }}
                                          />
                                        </svg>
                                      </div>

                                      {/* Center content */}
                                      <Sparkles className="h-16 w-16 text-primary animate-pulse z-10" />
                                      <p className="text-sm text-muted-foreground mt-4 font-medium z-10">
                                        Creating visualization...
                                      </p>
                                      <div className="flex gap-2 items-center mt-2 z-10">
                                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse [animation-delay:0.3s]"></div>
                                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse [animation-delay:0.6s]"></div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div
                                      className="max-w-full"
                                      dangerouslySetInnerHTML={{
                                        __html: message.svgData || "",
                                      }}
                                    />
                                  )}
                                </div>
                                <div className="p-2 bg-muted/10 border-t border-border">
                                  <p className="text-xs text-muted-foreground">
                                    {message.svgGenerating ? (
                                      "Generating a custom visualization for your query..."
                                    ) : (
                                      <>
                                        <span className="font-medium">
                                          Tip:
                                        </span>{" "}
                                        Hover over elements to see more details
                                      </>
                                    )}
                                  </p>
                                </div>
                              </div>
                            )}
                        </div>
                      </div>

                      {/* User Avatar - only show for first message in a group */}
                      {message.role === "user" &&
                        (index === 0 ||
                          messages[index - 1].role !== "user" ||
                          message.isNewGroup) && (
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarImage src="/abstract-user-icon.png" />
                            <AvatarFallback className="bg-primary">
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}

                      {/* Spacer for consecutive user messages */}
                      {message.role === "user" &&
                        index > 0 &&
                        messages[index - 1].role === "user" &&
                        !message.isNewGroup && <div className="w-8"></div>}
                    </div>
                  </motion.div>
                </React.Fragment>
              ))}
            </AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start mt-1"
              >
                <div className="flex items-start gap-2 max-w-[90%]">
                  {messages.length > 0 &&
                  messages[messages.length - 1].role === "assistant" ? (
                    <div className="w-8"></div>
                  ) : (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage src="/metallic-gaze.png" />
                      <AvatarFallback className="bg-primary/10">
                        <Brain className="h-4 w-4 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="p-4 bg-secondary text-secondary-foreground rounded-2xl rounded-tl-sm">
                    <div className="flex flex-col items-center justify-center">
                      <BookLoader
                        size="40px"
                        color="#4645F6"
                        textColor="#4645F6"
                        text={generatingStatus || "Thinking"}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        <CardFooter className="border-t border-border p-4 bg-background shadow-sm">
          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-3xl mx-auto gap-2"
          >
            <div className="relative flex-1">
              <Input
                placeholder="Type a message..."
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setShowDeepDive(!!e.target.value.trim());
                }}
                disabled={isTyping}
                className="pl-4 pr-10 py-3 rounded-full border-border bg-input text-foreground shadow-sm focus:shadow-md transition-all duration-200 placeholder:text-muted-foreground"
              />
              {!isTyping && input.trim() && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary"
                >
                  <Zap className="h-5 w-5 opacity-70" />
                </motion.div>
              )}
            </div>
            {input.trim() && (
              <div className="flex items-center gap-2">
                {showDeepDive && (
                  <div className="flex items-center space-x-1 bg-muted/30 px-3 py-1.5 rounded-full">
                    <button
                      type="button"
                      onClick={() => setDeepDiveEnabled(!deepDiveEnabled)}
                      className={`relative rounded-full h-5 w-10 flex items-center transition-colors ${
                        deepDiveEnabled ? "bg-primary" : "bg-muted"
                      }`}
                      disabled={isTyping}
                    >
                      <motion.div
                        className="absolute h-4 w-4 rounded-full bg-white shadow-sm"
                        animate={{ x: deepDiveEnabled ? 5 : 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    </button>
                    <span className="text-xs font-medium">
                      {deepDiveEnabled ? (
                        <span className="flex items-center gap-1 text-primary">
                          <Sparkles className="h-3 w-3" />
                          Deep Dive
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Deep Dive</span>
                      )}
                    </span>
                  </div>
                )}
                {/* SVG Toggle */}
                <div className="flex items-center space-x-1 bg-muted/30 px-3 py-1.5 rounded-full">
                  <button
                    type="button"
                    onClick={() => setForceSVG(!forceSVG)}
                    className={`relative rounded-full h-5 w-10 flex items-center transition-colors ${
                      forceSVG ? "bg-primary" : "bg-muted"
                    }`}
                    disabled={isTyping}
                  >
                    <motion.div
                      className="absolute h-4 w-4 rounded-full bg-white shadow-sm"
                      animate={{ x: forceSVG ? 5 : 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  </button>
                  <span className="text-xs font-medium">
                    {forceSVG ? (
                      <span className="flex items-center gap-1 text-primary">
                        <svg
                          className="h-3 w-3"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 2L2 7L12 12L22 7L12 2Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M2 17L12 22L22 17"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M2 12L12 17L22 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Visualize
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Visualize</span>
                    )}
                  </span>
                </div>
              </div>
            )}
            <Button
              type="submit"
              size="icon"
              disabled={isTyping || !input.trim()}
              className="h-12 w-12 rounded-full shadow-sm bg-primary hover:bg-primary/90"
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </CardFooter>
      </div>
    </Card>
  );
}
