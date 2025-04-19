"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, Download, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface JobStatus {
  job_id: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  message: string;
  video_url: string | null;
  script: any;
  error: string | null;
}

export function ManimVideoGenerator() {
  const [prompt, setPrompt] = useState("");
  const [quality, setQuality] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [activeTab, setActiveTab] = useState("video");

  // Poll for job status when jobId changes
  useEffect(() => {
    if (!jobId) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/manim-video?jobId=${jobId}`);
        if (!response.ok) {
          throw new Error("Failed to get job status");
        }
        
        const status = await response.json();
        setJobStatus(status);
        
        if (status.status === "completed" || status.status === "failed") {
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error("Error polling job status:", err);
        clearInterval(pollInterval);
      }
    }, 3000); // Poll every 3 seconds
    
    return () => clearInterval(pollInterval);
  }, [jobId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setJobStatus(null);
    
    try {
      const response = await fetch("/api/manim-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          quality,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate video");
      }
      
      const data = await response.json();
      setJobId(data.job_id);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!jobId) return;
    
    try {
      await fetch(`/api/manim-video?jobId=${jobId}`, {
        method: "DELETE",
      });
      
      setJobId(null);
      setJobStatus(null);
    } catch (err) {
      console.error("Error deleting job:", err);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt">What would you like to create a video about?</Label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., Explain the Pythagorean theorem with visual examples"
            rows={4}
            disabled={loading || jobStatus?.status === "processing"}
            required
            className="resize-none"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="quality">Quality</Label>
          <Select
            value={quality}
            onValueChange={setQuality}
            disabled={loading || jobStatus?.status === "processing"}
          >
            <SelectTrigger id="quality">
              <SelectValue placeholder="Select quality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low (Faster)</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High (Slower)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          type="submit" 
          disabled={loading || jobStatus?.status === "processing"}
          className="w-full"
        >
          {loading ? "Submitting..." : "Generate Video"}
        </Button>
      </form>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {jobStatus && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Job Status</h3>
              <span className="text-sm text-muted-foreground">
                {jobStatus.status === "queued" && "Queued"}
                {jobStatus.status === "processing" && "Processing"}
                {jobStatus.status === "completed" && "Completed"}
                {jobStatus.status === "failed" && "Failed"}
              </span>
            </div>
            
            {jobStatus.status === "processing" && (
              <div className="space-y-2">
                <Progress value={(jobStatus.progress || 0) * 100} />
                <p className="text-sm text-muted-foreground">{jobStatus.message || "Processing..."}</p>
              </div>
            )}
            
            {jobStatus.status === "failed" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Generation Failed</AlertTitle>
                <AlertDescription>{jobStatus.error || "Unknown error"}</AlertDescription>
              </Alert>
            )}
          </div>
          
          {jobStatus.status === "completed" && jobStatus.video_url && (
            <div className="space-y-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="video">Video</TabsTrigger>
                  <TabsTrigger value="script">Script</TabsTrigger>
                </TabsList>
                
                <TabsContent value="video" className="space-y-4">
                  <div className="rounded-md overflow-hidden border">
                    <video 
                      controls 
                      src={jobStatus.video_url} 
                      className="w-full aspect-video"
                    />
                  </div>
                  
                  <div className="flex justify-between">
                    <Button variant="outline" asChild>
                      <a 
                        href={jobStatus.video_url} 
                        download
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download Video
                      </a>
                    </Button>
                    
                    <Button 
                      variant="destructive" 
                      onClick={handleDelete}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Video
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="script">
                  {jobStatus.script && (
                    <Card>
                      <CardContent className="pt-6 space-y-4">
                        <div>
                          <h3 className="text-xl font-bold">{jobStatus.script.title}</h3>
                          <p className="text-muted-foreground">{jobStatus.script.description}</p>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-4">
                          {jobStatus.script.scenes.map((scene: any, index: number) => (
                            <div key={index} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium">Scene {index + 1}</span>
                                <span className="text-muted-foreground">{scene.startTime} - {scene.endTime}</span>
                              </div>
                              <p className="text-sm">{scene.narration}</p>
                              <p className="text-xs text-muted-foreground italic">{scene.visualDescription}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
