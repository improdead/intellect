import { Metadata } from "next";
import { ManimVideoGenerator } from "@/components/manim-video/manim-video-generator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Math Animations Generator",
  description: "Generate mathematical animations using Manim and AI",
};

export default function ManimVideosPage() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Math Animations Generator</h1>
        <p className="text-muted-foreground">
          Create precise mathematical animations using Manim and AI
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create a New Video</CardTitle>
          <CardDescription>
            Describe what you want to see in your mathematical animation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ManimVideoGenerator />
        </CardContent>
      </Card>
    </div>
  );
}
