'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Send,
  Brain,
  User,
  Video,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { BookLoader } from './book-loader';
import { MarkdownRenderer } from './markdown-renderer';
// Interactive tools menu is no longer used
import ExampleCards from './example-cards';
import SimpleVideoGenerator from './simple-video-generator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Sample chat messages for demonstration
const defaultMessages: ChatMessage[] = [
  {
    id: 1,
    role: 'assistant',
    content:
      "Hi there! I'm your AI assistant. How can I help you today?",
    timestamp: '18:49',
    isNewGroup: true,
    dateMarker: 'Today'
  },
];

interface ChatInterfaceProps {
  initialMessage?: string | null;
}

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isNewGroup?: boolean;
  dateMarker?: string;
  svgData?: string;
  videoGenerating?: boolean;
  videoProgress?: number;
  videoTimeRemaining?: string;
  videoUrl?: string;
}

// Helper function to generate fallback explanations when SVG generation fails
const generateFallbackExplanation = (topic: string): string => {
  // Extract keywords from the topic
  const keywords = topic.toLowerCase().split(/\s+/);

  // Determine the type of explanation based on keywords
  if (keywords.some(word => ['physics', 'force', 'motion', 'newton'].includes(word))) {
    return `# Physics: ${topic}

## Key Concepts
- Physics studies the behavior of matter and energy in space and time
- Understanding ${topic} requires examining fundamental principles and mathematical models
- This concept relates to how objects interact with their environment

## Applications
- This principle is applied in various engineering fields
- It helps explain natural phenomena we observe in daily life
- Modern technology relies on these physics concepts`;
  }
  else if (keywords.some(word => ['math', 'equation', 'formula', 'calculus'].includes(word))) {
    return `# Mathematics: ${topic}

## Key Concepts
- Mathematics provides the language to describe patterns and relationships
- ${topic} is a fundamental concept that helps solve complex problems
- Understanding this requires both intuition and formal reasoning

## Applications
- This mathematical concept is used in various scientific fields
- It provides tools for modeling real-world phenomena
- Modern computing and technology rely on these mathematical foundations`;
  }
  else if (keywords.some(word => ['biology', 'cell', 'organism', 'dna'].includes(word))) {
    return `# Biology: ${topic}

## Key Concepts
- Biology studies living organisms and their interactions with the environment
- ${topic} is a fundamental concept in understanding life processes
- This relates to how organisms function and evolve

## Significance
- This biological concept helps explain diversity in living things
- It has implications for medicine and health sciences
- Understanding this helps us address environmental and ecological challenges`;
  }
  else {
    return `# ${topic}

## Key Concepts
- ${topic} is an important concept that helps us understand the world
- It involves several interconnected principles and ideas
- Understanding this topic requires examining it from multiple perspectives

## Applications
- This concept has practical applications in various fields
- It helps explain phenomena we observe in our environment
- Modern approaches have expanded our understanding of this topic`;
  }
};

export default function ChatInterfaceRedesigned({ initialMessage }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(defaultMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; parts: { text: string }[] }[]>([]);
  const [isFirstMessage, setIsFirstMessage] = useState(messages.length <= 1);
  const [generatingStatus, setGeneratingStatus] = useState('');
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);
  const [activeTab, setActiveTab] = useState('interactive');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Process initial message if provided
  useEffect(() => {
    if (initialMessage) {
      handleSendMessage(initialMessage);
      setShowWelcomeScreen(false);
    }
  }, [initialMessage]);

  const handleSendMessage = (messageText: string) => {
    // Create user message
    const userMessage: ChatMessage = {
      id: messages.length + 1,
      role: 'user',
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isNewGroup: true,
    };

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);

    // Create a placeholder for the AI response
    const aiPlaceholder: ChatMessage = {
      id: messages.length + 2,
      role: 'assistant',
      content: 'I\'m thinking about your question...',
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, aiPlaceholder]);

    // Set UI state
    setIsTyping(true);
    setGeneratingStatus('Thinking...');
    setShowWelcomeScreen(false);

    // Call the API to get both text response and SVG visualization
    fetch('/api/text-with-svg', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: messageText,
      }),
      cache: 'no-store', // Ensure we don't get cached responses
    })
      .then(response => {
        if (!response.ok) {
          console.error(`API error: ${response.status}`);
          return response.text().then(text => {
            throw new Error(`Request failed: ${response.status} - ${text}`);
          });
        }
        return response.json();
      })
      .then(data => {
        // Update the placeholder with the actual text response
        setMessages((prev) =>
          prev.map(msg =>
            msg.id === aiPlaceholder.id
              ? {
                  ...msg,
                  content: data.textResponse,
                  svgData: data.svgData, // Store the SVG data for rendering
                }
              : msg
          )
        );

        // Update chat history
        setChatHistory(prev => [
          ...prev,
          { role: 'user', parts: [{ text: messageText }] },
          { role: 'model', parts: [{ text: data.textResponse }] }
        ]);

        setIsTyping(false);
        setIsFirstMessage(false);
      })
      .catch(error => {
        console.error('Error getting response:', error);
        setIsTyping(false);

        // Fallback response if the API call fails
        setMessages((prev) =>
          prev.map(msg =>
            msg.id === aiPlaceholder.id
              ? {
                  ...msg,
                  content: `I encountered an issue while processing your request about "${messageText}". Let me provide a basic explanation instead.\n\n## ${messageText}\n\nThis topic involves several key concepts and principles that are important to understand. While I couldn't generate a complete response, I can offer some general information.\n\nThe study of ${messageText} typically involves examining its structure, function, and relationships with other concepts in the field.\n\nWould you like me to try again or focus on a specific aspect of this topic?`,
                }
              : msg
          )
        );
      });

    // Clear input if this was typed by the user
    setInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    handleSendMessage(input);
  };

  const handleToolSelect = (toolId: string) => {
    // Get the user's current input or use a default topic
    const topic = input.trim() || "Newton's first law";

    if (toolId === 'video') {
      // Handle AI video generation with LangGraph workflow
      const userMessage: ChatMessage = {
        id: messages.length + 1,
        role: 'user',
        content: `Generate a video about ${topic}`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isNewGroup: true,
      };

      // Add user message to chat
      setMessages((prev) => [...prev, userMessage]);
      setInput(''); // Clear the input field
      setShowWelcomeScreen(false); // Hide welcome screen if visible

      // First AI response - planning the video
      const aiPlanningMessage: ChatMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: `I'll generate a video about ${topic} using Gemini 2.0 Pro for script generation. Let me plan this out:

1. First, I'll create a script with key points about ${topic}
2. Then I'll generate the visual elements and animations
3. Finally, I'll add narration and background music

Starting the generation process now...`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      // Add planning message
      setMessages((prev) => [...prev, aiPlanningMessage]);

      // After a short delay, show the video generation progress
      setTimeout(() => {
        // Create a placeholder for the AI response with video generation
        const aiPlaceholder: ChatMessage = {
          id: messages.length + 3,
          role: 'assistant',
          content: `Generating a video about ${topic}...`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          videoGenerating: true,
          videoProgress: 0,
          videoTimeRemaining: '3:45 remaining',
        };

        setMessages((prev) => [...prev, aiPlaceholder]);

        // Use client-side video generator instead of API
        // Create a message ID for reference
        const messageId = aiPlaceholder.id;

        // Update the message with a client-side video generator component
        setMessages((prev) =>
          prev.map(msg =>
            msg.id === messageId
              ? {
                  ...msg,
                  content: `Generating a video about ${topic}...`,
                  videoGenerating: true,
                  videoProgress: 10,
                }
              : msg
          )
        );

        // Set up handlers for the client-side generator
        const handleProgress = (progress: number, stage: string) => {
          setMessages((prev) =>
            prev.map(msg =>
              msg.id === messageId
                ? {
                    ...msg,
                    content: `${stage} (${progress}% complete)`,
                    videoProgress: progress,
                    videoTimeRemaining: `${Math.floor((100 - progress) / 4)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} remaining`,
                  }
                : msg
            )
          );
        };

        const handleComplete = (videoUrl: string) => {
          // Update with completed video
          setMessages((prev) =>
            prev.map(msg =>
              msg.id === messageId
                ? {
                    ...msg,
                    content: `I've created a video about ${topic}. This visualization explains the key concepts and helps make the topic more accessible. The video includes animated visuals with narration to guide you through the main points.`,
                    videoGenerating: false,
                    videoUrl: videoUrl,
                  }
                : msg
            )
          );

          // Add a follow-up message with additional context
          setTimeout(() => {
            const followUpMessage: ChatMessage = {
              id: messages.length + 4,
              role: 'assistant',
              content: `Would you like me to explain any specific aspect of ${topic} in more detail? Or would you prefer a different style of video for this topic?`,
              timestamp: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
            };

            setMessages((prev) => [...prev, followUpMessage]);
          }, 2000);
        };

        // Render the client-side generator (invisible in the DOM)
        const videoGenerator = document.createElement('div');
        videoGenerator.style.display = 'none';
        document.body.appendChild(videoGenerator);

        // Start the client-side generation process
        setTimeout(() => {
          // Simulate progress updates
          let progress = 10;
          const stages = [
            'Generating script',
            'Generating voice narration',
            'Creating animations',
            'Rendering frames',
            'Finalizing video'
          ];

          const interval = setInterval(() => {
            progress += 15;
            const stageIndex = Math.min(Math.floor(progress / 20), stages.length - 1);

            handleProgress(progress, stages[stageIndex]);

            if (progress >= 100) {
              clearInterval(interval);
              handleComplete('https://fs-opennote-us-east-1.s3.us-east-1.amazonaws.com/2025-04-18T15:09:11.338354---1551e7de-1c67-11f0-9c6f-0afffc63bc59---output.mp4');
              document.body.removeChild(videoGenerator);
            }
          }, 2000);
        }, 1000);
      }, 1500);
    } else if (toolId === 'interactive') {
      // Handle interactive SVG generation with text explanation
      const userMessage: ChatMessage = {
        id: messages.length + 1,
        role: 'user',
        content: `Create an interactive SVG visualization about ${topic}`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isNewGroup: true,
      };

      // Add user message to chat and clear input
      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setShowWelcomeScreen(false); // Hide welcome screen if visible

      // Set typing indicator
      setIsTyping(true);
      setGeneratingStatus('Generating text explanation and interactive visualization...');

      // Call the combined API to generate both text and SVG
      fetch('/api/text-with-svg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: topic,
        }),
        cache: 'no-store', // Ensure we don't get cached responses
      })
        .then(response => {
          if (!response.ok) {
            console.error(`API error: ${response.status}`);
            return response.text().then(text => {
              throw new Error(`Request failed: ${response.status} - ${text}`);
            });
          }
          return response.json();
        })
        .then(data => {
          setIsTyping(false);

          // Create the response with both text and SVG data
          const aiResponse: ChatMessage = {
            id: messages.length + 2,
            role: 'assistant',
            content: data.textResponse,
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            svgData: data.svgData, // Store the SVG data for rendering
          };

          setMessages((prev) => [...prev, aiResponse]);
        })
        .catch(error => {
          console.error('Error generating response:', error);
          setIsTyping(false);

          // Fallback to simulated response if API call fails
          // First, send a message about the error
          setTimeout(() => {
            const errorMessage: ChatMessage = {
              id: messages.length + 2,
              role: 'assistant',
              content: `I encountered a technical issue while trying to create a response about ${topic}.\n\nError details: ${error.message}`,
              timestamp: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
            };

            setMessages((prev) => [...prev, errorMessage]);

            // Then, after a short delay, send a fallback response with a text explanation
            setTimeout(() => {
              const fallbackResponse: ChatMessage = {
                id: messages.length + 3,
                role: 'assistant',
                content: `Let me provide a text explanation about ${topic} instead:\n\n${generateFallbackExplanation(topic)}\n\nWould you like me to explain any specific aspect of ${topic} in more detail?`,
                timestamp: new Date().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
              };

              setMessages((prev) => [...prev, fallbackResponse]);
            }, 2000);
          }, 1500);
        });
    } else if (toolId === 'deepdive') {
      // Handle deep dive with advanced reasoning
      const userMessage: ChatMessage = {
        id: messages.length + 1,
        role: 'user',
        content: `Provide a deep dive analysis of ${topic}`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isNewGroup: true,
      };

      // Add user message to chat and clear input
      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setShowWelcomeScreen(false); // Hide welcome screen if visible

      // Set typing indicator
      setIsTyping(true);
      setGeneratingStatus('Analyzing with advanced reasoning...');

      // First response - planning the analysis
      setTimeout(() => {
        const aiPlanningMessage: ChatMessage = {
          id: messages.length + 2,
          role: 'assistant',
          content: `I'll provide a comprehensive analysis of ${topic} using advanced reasoning capabilities. Let me gather the most relevant information and organize it into a structured deep dive.`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };

        setMessages((prev) => [...prev, aiPlanningMessage]);

        // Simulate AI response with deep dive analysis after a delay
        setTimeout(() => {
          const aiResponse: ChatMessage = {
            id: messages.length + 3,
            role: 'assistant',
            content: `# Deep Dive: ${topic}\n\nHere's a comprehensive analysis of ${topic} using advanced reasoning capabilities.\n\n## Key Concepts\n\n- The fundamental principles of ${topic} include several important aspects that are often overlooked in basic discussions\n- Recent research has revealed new insights about how ${topic} relates to other fields and disciplines\n- Understanding ${topic} requires examining it from multiple perspectives: historical, theoretical, and practical\n- The evolution of thinking around ${topic} shows significant paradigm shifts over time\n\n## Theoretical Framework\n\n1. The foundational theories that underpin ${topic} can be traced back to several key developments\n2. Modern interpretations have expanded on these foundations in significant ways\n3. Current academic discourse centers around several competing models\n4. These theoretical frameworks provide different lenses through which to understand ${topic}\n\n## Practical Applications\n\n1. ${topic} is frequently applied in various real-world scenarios with measurable outcomes\n2. Experts in the field have developed several methodologies based on ${topic}\n3. Case studies demonstrate the effectiveness of these approaches in different contexts\n4. Future developments may expand the utility of ${topic} even further\n\n## Critical Analysis\n\n- While ${topic} offers many benefits, there are also limitations to consider\n- Alternative approaches may be more effective in certain situations\n- Ethical considerations should guide the application of ${topic}\n- The future direction of ${topic} will likely be influenced by emerging technologies and changing societal needs\n\n*This deep dive analysis was generated using advanced reasoning capabilities, drawing on a comprehensive knowledge base and sophisticated analytical frameworks.*`,
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          };

          setMessages((prev) => [...prev, aiResponse]);
          setIsTyping(false);

          // Add a follow-up question after a short delay
          setTimeout(() => {
            const followUpMessage: ChatMessage = {
              id: messages.length + 4,
              role: 'assistant',
              content: `Would you like me to explore any specific aspect of ${topic} in more detail? Or perhaps compare it with related concepts?`,
              timestamp: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
            };

            setMessages((prev) => [...prev, followUpMessage]);
          }, 2000);
        }, 4000);
      }, 1500);
    } else {
      // Handle other tools
      handleSendMessage(`I'd like to use the ${toolId} tool to explore ${topic}`);
    }
  };

  const handleExampleSelect = (example: string) => {
    handleSendMessage(example);
  };

  return (
    <Card className="h-full border-0 rounded-none shadow-none bg-background text-foreground overflow-hidden font-rubik">
      {/* Main chat area */}
      <div className="flex flex-col h-full">
        <CardHeader className="border-b border-border px-6 py-3 bg-background shadow-sm flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage src="/metallic-gaze.png" />
              <AvatarFallback className="bg-primary/10">
                <Brain className="h-5 w-5 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-medium">Dashboard</h2>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3 text-primary" />
                <span>Your ultimate learning companion</span>
              </div>
            </div>
          </div>

          {/* Header right area - intentionally left empty */}
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6 bg-background">
          {showWelcomeScreen ? (
            <div className="max-w-4xl mx-auto mt-8">
              <div className="text-center mb-12">
                <h1 className="text-3xl font-bold mb-4">What do you want to learn today?</h1>
                <p className="text-muted-foreground mb-8">
                  Learn exactly how you want to with every learning tool you might need at your disposal.
                </p>

                <Tabs defaultValue="interactive" className="max-w-3xl mx-auto" onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-2 mb-8">
                    <TabsTrigger value="interactive">Interactive Tools</TabsTrigger>
                    <TabsTrigger value="examples">Examples</TabsTrigger>
                  </TabsList>

                  <TabsContent value="interactive" className="mt-4">
                    <div className="grid grid-cols-3 gap-4">
                      <Card
                        className="p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border-0"
                        onClick={() => handleToolSelect('interactive')}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="mb-3 bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400"><path d="M12 18h.01"></path><path d="M7 6h10"></path><path d="M17 12H7"></path><path d="M7 18h4"></path><rect width="18" height="18" x="3" y="3" rx="2"></rect></svg>
                          </div>
                          <h3 className="font-medium mb-1">INTERACTIVE ELEMENTS</h3>
                          <p className="text-sm text-muted-foreground">Create interactive visualizations to explore concepts</p>
                          <div className="mt-3 text-xs text-muted-foreground">
                            Type a topic and select this tool
                          </div>
                        </div>
                      </Card>

                      <Card
                        className="p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 border-0"
                        onClick={() => handleToolSelect('video')}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="mb-3 bg-amber-100 dark:bg-amber-900/30 p-3 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 dark:text-amber-400"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                          </div>
                          <h3 className="font-medium mb-1">VIDEO GENERATION</h3>
                          <p className="text-sm text-muted-foreground">Generate personalized videos to explain any concept</p>
                          <div className="mt-3 text-xs text-muted-foreground">
                            Type a topic and select this tool
                          </div>
                        </div>
                      </Card>

                      <Card
                        className="p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/20 border-0"
                        onClick={() => handleToolSelect('deepdive')}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="mb-3 bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600 dark:text-purple-400"><path d="M2 12h10"></path><path d="M9 4v16"></path><path d="m3 9 3 3-3 3"></path><path d="M14 8V6c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v12c0 1.1-.9 2-2 2h-4a2 2 0 0 1-2-2v-2"></path></svg>
                          </div>
                          <h3 className="font-medium mb-1">DEEP DIVE</h3>
                          <p className="text-sm text-muted-foreground">Get comprehensive analysis with advanced reasoning</p>
                          <div className="mt-3 text-xs text-muted-foreground">
                            Type a topic and select this tool
                          </div>
                        </div>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="examples" className="mt-4">
                    <ExampleCards onExampleSelect={handleExampleSelect} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          ) : (
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
                        {message.role === "assistant" && index > 0 && messages[index-1].role === "assistant" && !message.isNewGroup && <div className="w-8"></div>}

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
                              <>
                                <MarkdownRenderer
                                  content={message.content}
                                  className="text-sm leading-relaxed"
                                  svgData={message.svgData}
                                />

                                {/* Video generation with simplified component */}
                                {message.videoGenerating && (
                                  <div className="mt-4">
                                    <SimpleVideoGenerator topic={message.content.replace('Generating a video about ', '').replace('...', '')} />
                                  </div>
                                )}

                                {/* Video player */}
                                {message.videoUrl && (
                                  <div className="mt-4">
                                    <video
                                      controls
                                      className="w-full rounded-lg"
                                      src={message.videoUrl}
                                    />
                                  </div>
                                )}
                              </>
                            ) : (
                              <p className="text-sm">{message.content}</p>
                            )}
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
                        {message.role === "user" && index > 0 && messages[index-1].role === "user" && !message.isNewGroup && <div className="w-8"></div>}
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
                    {messages.length > 0 && messages[messages.length - 1].role === "assistant" ? (
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
          )}
        </CardContent>

        <CardFooter className="border-t border-border p-4 bg-background shadow-sm">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col w-full max-w-3xl mx-auto gap-2"
          >
            <div className="relative flex-1 flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="pr-10 py-6 text-base rounded-full bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/30 shadow-sm"
                />
              </div>

              <Button
                type="submit"
                size="icon"
                disabled={isTyping || !input.trim()}
                className="h-12 w-12 rounded-full shadow-sm bg-primary hover:bg-primary/90"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>

            {/* Output options that appear when user types or after first message */}
            {(input.trim().length > 0 || !isFirstMessage) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-2 mt-2 justify-center"
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleToolSelect('video')}
                  className="rounded-full bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-900/40"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Generate Video
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleToolSelect('interactive')}
                  className="rounded-full bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/40"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M12 18h.01"></path><path d="M7 6h10"></path><path d="M17 12H7"></path><path d="M7 18h4"></path><rect width="18" height="18" x="3" y="3" rx="2"></rect></svg>
                  Interactive Element
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleToolSelect('deepdive')}
                  className="rounded-full bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800 dark:hover:bg-purple-900/40"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M2 12h10"></path><path d="M9 4v16"></path><path d="m3 9 3 3-3 3"></path><path d="M14 8V6c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v12c0 1.1-.9 2-2 2h-4a2 2 0 0 1-2-2v-2"></path></svg>
                  Deep Dive Analysis
                </Button>
              </motion.div>
            )}
          </form>
        </CardFooter>
      </div>
    </Card>
  );
}
