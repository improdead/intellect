'use client';

import React from 'react';
import ChatInterface from '@/components/chat-interface';

export default function ChatPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-theme(space.16))]">
      {/* Chat Interface */}
      <div className="flex-1">
        <ChatInterface />
      </div>
    </div>
  );
}
