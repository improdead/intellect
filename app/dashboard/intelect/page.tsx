"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import ChatInterfaceRedesigned from "@/components/chat-interface-redesigned";
import { useSearchParams } from "next/navigation";

export default function IntelectPage() {
  const searchParams = useSearchParams();
  const [initialQuery, setInitialQuery] = useState<string | null>(null);
  const processedQueryRef = useRef<string | null>(null);

  // Extract query parameter on component mount
  useEffect(() => {
    const query = searchParams.get("query");
    if (query && query !== processedQueryRef.current) {
      processedQueryRef.current = query;
      setInitialQuery(query);
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col h-[calc(100vh-theme(space.16))]">
      {/* Chat Interface with redesigned UI */}
      <div className="flex-1">
        <ChatInterfaceRedesigned initialMessage={initialQuery} />
      </div>

      {/* Floating decoration elements */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <motion.div
          className="absolute top-[10%] right-[5%] w-64 h-64 rounded-full bg-indigo-300/10 dark:bg-indigo-500/5 blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute bottom-[20%] left-[10%] w-80 h-80 rounded-full bg-primary/10 dark:bg-primary/5 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1,
          }}
        />
      </div>
    </div>
  );
}
