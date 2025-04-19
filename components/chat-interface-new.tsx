"use client";

import React, { useState, useRef, useEffect } from "react";
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
  PanelRight,
  PanelRightClose,
  Trash2,
} from "lucide-react";
import { BookLoader } from "./book-loader";
import { MarkdownRenderer } from "./markdown-renderer";
import { useChat } from "ai/react";

// Sample chat messages for demonstration
const defaultMessages = [
  {
    id: 1,
    role: "assistant",
    content:
      "Hi there! I'm your AI assistant. How can I help you today?",
    timestamp: "18:49",
    isNewGroup: true,
    dateMarker: "Today"
  },
];

interface ChatInterfaceProps {
  initialMessage?: string | null;
}

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isNewGroup?: boolean;
  dateMarker?: string;
  svgData?: string; // SVG content to display
}

export default function ChatInterface({ initialMessage }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(defaultMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; parts: { text: string }[] }[]>([]);
  const [showDeepDive, setShowDeepDive] = useState(false);
  const [deepDiveEnabled, setDeepDiveEnabled] = useState(false);
  const [isFirstMessage, setIsFirstMessage] = useState(messages.length <= 1);
  const [generatingStatus, setGeneratingStatus] = useState("");
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isSvgLoading, setIsSvgLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Setup AI chat with streaming
  const {
    messages: aiMessages,
    input: aiInput,
    handleInputChange,
    handleSubmit: handleAiSubmit,
    isLoading: aiIsLoading,
    setMessages: setAiMessages,
  } = useChat({
    api: '/api/chat/streaming',
    initialMessages: [],
    onFinish: async (message) => {
      // Update chat history for future API calls
      setChatHistory(prev => [
        ...prev,
        { role: 'user', parts: [{ text: input }] },
        { role: 'model', parts: [{ text: message.content }] }
      ]);

      // No longer first message after this
      setIsFirstMessage(false);
      // Reset Deep Dive toggle
      setDeepDiveEnabled(false);
      setIsTyping(false);

      // Generate SVG if needed
      const shouldGenerateSVG = isFirstMessage || deepDiveEnabled;
      if (shouldGenerateSVG) {
        // Show SVG loading animation
        setIsSvgLoading(true);
        setSidebarVisible(true);
        setGeneratingStatus("Generating visualization...");

        try {
          // Now get the SVG in a non-blocking way
          const svgResponse = await fetch('/api/svg', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              prompt: input,
            }),
          });

          if (svgResponse.ok) {
            const svgResult = await svgResponse.json();
            // Update the message with SVG data
            setMessages(prev => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage && lastMessage.role === "assistant") {
                return prev.map((msg, index) => 
                  index === prev.length - 1
                    ? { ...msg, svgData: svgResult.svgData }
                    : msg
                );
              }
              return prev;
            });
            console.log("SVG generation complete");
          } else {
            throw new Error('SVG generation failed');
          }
        } catch (svgError) {
          console.error('Error generating SVG:', svgError);
        } finally {
          setIsSvgLoading(false);
          setGeneratingStatus("");
        }
      }
    },
    onError: (error) => {
      console.error("Error in AI chat:", error);
      setIsTyping(false);
      setIsSvgLoading(false);
    },
  });

  // Function to format AI response as a single message
  const splitIntoMultipleMessages = (content: string): string[] => {
    // Clean up any excessive formatting like **** or multiple asterisks
    let cleanedContent = content
      .replace(/\*{2,}/g, '') // Remove multiple asterisks
      .replace(/\*\s*\*\s*\*/g, '') // Remove patterns like * * *
      .trim();

    // Return as a single message instead of splitting by paragraphs
    return [cleanedContent];
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Process initial message if provided
  useEffect(() => {
    if (initialMessage) {
      // Simulate user sending the initial message
      const userMessage: ChatMessage = {
        id: messages.length + 1,
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

      // Submit to AI with streaming
      handleAiSubmit(new Event('submit') as any, {
        options: {
          body: {
            message: initialMessage,
            history: chatHistory,
            useThinkingModel: false,
            isFollowUp: false,
          },
        },
      });
    }
  }, [initialMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-hide sidebar when no SVG is available
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && !lastMessage.svgData && !isSvgLoading) {
        setSidebarVisible(false);
      }
    }
  }, [messages, isSvgLoading]);

  // Persist chat history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    }
  }, [messages]);

  // Load chat history from localStorage on initial load
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory && messages.length === 0) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setMessages(parsedHistory);

        // Also update the chatHistory state for API calls
        const apiHistory: { role: "user" | "model"; parts: { text: string; }[]; }[] = [];
        for (let i = 0; i < parsedHistory.length; i++) {
          const msg = parsedHistory[i];
          if (msg.role === 'user') {
            apiHistory.push({ role: 'user', parts: [{ text: msg.content }] });
          } else if (msg.role === 'assistant') {
            apiHistory.push({ role: 'model', parts: [{ text: msg.content }] });
          }
        }
        setChatHistory(apiHistory);
      } catch (error) {
        console.error('Error loading chat history:', error);
        localStorage.removeItem('chatHistory');
      }
    }
  }, []);

  // Update our message content as streaming happens
  useEffect(() => {
    if (aiMessages.length > 0 && messages.length > 0) {
      const lastAiMessage = aiMessages[aiMessages.length - 1];
      if (lastAiMessage.role === "assistant") {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessageIndex = newMessages.length - 1;
          if (newMessages[lastMessageIndex].role === "assistant") {
            newMessages[lastMessageIndex] = {
              ...newMessages[lastMessageIndex],
              content: lastAiMessage.content,
            };
          }
          return newMessages;
        });
      }
    }
  }, [aiMessages]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to our local state
    const userMessage: ChatMessage = {
      id: messages.length + 1,
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isNewGroup: messages.length > 0 &&
        messages[messages.length - 1].role !== "user" &&
        new Date().getTime() - new Date().setHours(
          parseInt(messages[messages.length - 1].timestamp.split(":")[0]),
          parseInt(messages[messages.length - 1].timestamp.split(":")[1])
        ) > 5 * 60 * 1000, // 5 minutes difference
    };
    setMessages((prev) => [...prev, userMessage]);
    
    // Create a placeholder for the AI response
    const aiPlaceholder: ChatMessage = {
      id: messages.length + 2,
      role: "assistant",
      content: "", // Empty content that will be streamed
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      svgData: undefined,
    };
    setMessages((prev) => [...prev, aiPlaceholder]);
    
    // Set UI state
    setIsTyping(true);
    setShowDeepDive(false);
    setGeneratingStatus(deepDiveEnabled ? "Generating deep dive response..." : "Thinking...");
    
    // Submit to AI with streaming
    handleAiSubmit(e, {
      options: {
        body: {
          message: input,
          history: chatHistory,
          useThinkingModel: deepDiveEnabled,
          isFollowUp: !isFirstMessage,
        },
      },
    });
    
    // Clear input
    setInput("");
  };

  return (
    <Card className={`h-full border-0 rounded-none shadow-none bg-background text-foreground grid ${sidebarVisible ? 'grid-cols-[1fr,600px]' : 'grid-cols-[1fr,0px]'} overflow-hidden transition-all duration-300`}>
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
              <CardTitle className="text-base font-medium">intelect AI</CardTitle>
              <p className="text-xs text-muted-foreground">Active now</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-9 w-9"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear the chat history?')) {
                  localStorage.removeItem('chatHistory');
                  setMessages([]);
                  setChatHistory([]);
                  setIsFirstMessage(true);
                }
              }}
              title="Clear chat history"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
              <Video className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-9 w-9 relative"
              onClick={() => setSidebarVisible(!sidebarVisible)}
              title={sidebarVisible ? "Hide visualization panel" : "Show visualization panel"}
            >
              {sidebarVisible ? (
                <PanelRightClose className="h-5 w-5" />
              ) : (
                <PanelRight className="h-5 w-5" />
              )}
              {messages.length > 0 && messages[messages.length - 1].svgData && !sidebarVisible && (
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary"></span>
              )}
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
                      {new Date().toLocaleString('en-US', { weekday: 'short' })} {message.timestamp}
                    </div>
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  } ${index > 0 && messages[index-1].role === message.role && !message.isNewGroup ? "mt-1" : "mt-3"}`}
                >
                  <div className={`flex items-start gap-2 ${message.role === "assistant" ? "max-w-[90%]" : "max-w-[80%]"}`}>
                    {/* AI Avatar - only show for first message in a group */}
                    {message.role === "assistant" && (index === 0 || messages[index-1].role !== "assistant" || message.isNewGroup) && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarImage src="/metallic-gaze.png" />
                        <AvatarFallback className="bg-primary/10">
                          <Brain className="h-4 w-4 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    {/* Spacer for consecutive AI messages */}
                    {message.role === "assistant" && index > 0 && messages[index-1].role === "assistant" && !message.isNewGroup && (
                      <div className="w-8"></div>
                    )}

                    <div
                      className={`${message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm p-3"
                        : "bg-secondary text-secondary-foreground rounded-2xl rounded-tl-sm p-4"
                      } ${index > 0 && messages[index-1].role === message.role && !message.isNewGroup
                        ? (message.role === "user" ? "rounded-tr-2xl" : "rounded-tl-2xl")
                        : ""}`}
                    >
                      <div className="w-full">
                        {message.role === "assistant" ? (
                          <MarkdownRenderer 
                            content={message.content} 
                            className="text-sm leading-relaxed"
                          />
                        ) : (
                          <p className="text-sm">{message.content}</p>
                        )}
                        {/* SVGs are now displayed in the side panel */}
                      </div>
                    </div>

                    {/* User Avatar - only show for first message in a group */}
                    {message.role === "user" && (index === 0 || messages[index-1].role !== "user" || message.isNewGroup) && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarImage src="/abstract-user-icon.png" />
                        <AvatarFallback className="bg-primary">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    {/* Spacer for consecutive user messages */}
                    {message.role === "user" && index > 0 && messages[index-1].role === "user" && !message.isNewGroup && (
                      <div className="w-8"></div>
                    )}
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
                {messages.length > 0 && messages[messages.length-1].role === "assistant" ? (
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
          {showDeepDive && (
            <div className="flex items-center gap-2">
              <div className="flex items-center space-x-1 bg-muted/30 px-3 py-1.5 rounded-full">
                <button
                  type="button"
                  onClick={() => setDeepDiveEnabled(!deepDiveEnabled)}
                  className={`relative rounded-full h-5 w-10 flex items-center transition-colors ${deepDiveEnabled ? 'bg-primary' : 'bg-muted'}`}
                  disabled={isTyping}
                >
                  <motion.div
                    className="absolute h-4 w-4 rounded-full bg-white shadow-sm"
                    animate={{ x: deepDiveEnabled ? 5 : 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
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
      {/* SVG visualization and description panel - only visible when SVG exists or is loading */}
      <div className={`${sidebarVisible ? 'w-[600px]' : 'w-0'} border-l border-border flex flex-col h-full overflow-hidden transition-all duration-300`}>
        {/* Current SVG visualization */}
        {isSvgLoading ? (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-medium">Generating Visualization</h3>
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
            <div className="flex-3 overflow-auto p-4 flex items-center justify-center h-[75%]">
              <div className="text-center">
                <div className="relative w-[400px] h-[300px] bg-muted/30 rounded-lg flex flex-col items-center justify-center overflow-hidden">
                  {/* Background animation */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 to-transparent animate-pulse"></div>
                    <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-primary/10 animate-ping [animation-duration:3s]"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-24 h-24 rounded-full bg-primary/10 animate-ping [animation-duration:2.5s] [animation-delay:0.5s]"></div>
                  </div>

                  {/* Main content */}
                  <Sparkles className="h-16 w-16 text-primary animate-pulse" />
                  <div className="mt-6 flex flex-col items-center z-10">
                    <div className="flex gap-2 items-center">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse [animation-delay:0.3s]"></div>
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse [animation-delay:0.6s]"></div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4 font-medium">Creating visualization...</p>
                    <p className="text-xs text-muted-foreground mt-2">This may take a few moments</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-border h-[25%]">
              <h3 className="text-sm font-medium mb-2">Description</h3>
              <div className="animate-pulse space-y-2">
                <div className="h-3 bg-muted/50 rounded w-3/4"></div>
                <div className="h-3 bg-muted/50 rounded w-1/2"></div>
                <div className="h-3 bg-muted/50 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ) : messages.length > 0 && messages[messages.length - 1].svgData ? (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-medium">Visualization</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setSidebarVisible(false)}
              >
                <PanelRightClose className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-3 overflow-auto p-4 flex items-center justify-center h-[75%]">
              <div
                className="rounded-lg overflow-hidden border border-border shadow-md max-w-full max-h-full"
                dangerouslySetInnerHTML={{ __html: messages[messages.length - 1].svgData || '' }}
              />
            </div>
            <div className="p-4 border-t border-border h-[25%]">
              <h3 className="text-sm font-medium mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">
                This visualization illustrates {messages.length > 0 && messages[messages.length - 1].content.substring(0, 50)}...
              </p>
              <div className="mt-3">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Tip:</span> Hover over elements to see more details. The visualization is interactive.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full p-6 text-muted-foreground">
            <div className="text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Ask a question to generate a visualization</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
