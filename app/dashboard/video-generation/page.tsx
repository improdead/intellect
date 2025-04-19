"use client";

import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Dynamically import the VideoChat component with no SSR to avoid hydration issues
// with Chakra UI components
const VideoChat = dynamic(() => import("@/app/components/VideoChat"), {
  ssr: false,
});

export default function VideoGenerationPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Educational Video Generator</h1>
        <p className="text-muted-foreground">
          Create comprehensive educational videos with animations and voice narration
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create a New Video</CardTitle>
          <CardDescription>
            Describe what you want to see in your educational video
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VideoChat />
        </CardContent>
      </Card>
    </div>
  );
}
