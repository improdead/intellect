"use client";

import React from 'react';
import ChatInterface from './chat-interface';

interface ChatInterfaceWithHistoryProps {
  initialMessage?: string | null;
}

export default function ChatInterfaceWithHistory({ initialMessage }: ChatInterfaceWithHistoryProps) {
  // For now, we'll just render the ChatInterface component
  // We'll add history tracking back once the basic functionality is working
  return <ChatInterface initialMessage={initialMessage} />;
}
