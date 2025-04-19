"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  ArrowUpRight,
  ArrowRight,
  BarChart2,
  Clock,
  Sparkles,
} from "lucide-react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { enhancedHistoryService } from "@/lib/enhanced-history-service";
import AchievementsSection from "./achievements-section";

// We'll implement the PDF generation directly in the component
// to avoid issues with dynamic imports

// Default data for charts (will be replaced with real data)
const defaultWeeklyProgressData = [
  { day: "Sun", minutes: 0, topics: 0 },
  { day: "Mon", minutes: 0, topics: 0 },
  { day: "Tue", minutes: 0, topics: 0 },
  { day: "Wed", minutes: 0, topics: 0 },
  { day: "Thu", minutes: 0, topics: 0 },
  { day: "Fri", minutes: 0, topics: 0 },
  { day: "Sat", minutes: 0, topics: 0 },
];

const defaultSubjectProgressData = [{ subject: "Loading...", progress: 0 }];

export default function ProgressPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progressData, setProgressData] = useState({
    weeklyProgress: defaultWeeklyProgressData,
    subjectProgress: defaultSubjectProgressData,
    stats: {
      studyTime: "0 hours",
      topicsCovered: 0,
      quizScore: "0%",
      streak: 0,
    },
  });

  // Fetch real data from Supabase
  useEffect(() => {
    async function fetchData() {
      if (user?.sub) {
        try {
          setIsLoading(true);

          // Get progress data
          const progressStats =
            await enhancedHistoryService.getUserProgressData(user.sub);

          // Get overview data (charts)
          const overviewData = await enhancedHistoryService.getOverviewData(
            user.sub
          );

          if (overviewData) {
            setProgressData({
              weeklyProgress: overviewData.weeklyProgress,
              subjectProgress: overviewData.subjectProgress,
              stats: {
                studyTime: `${progressStats.totalHours} hours`,
                topicsCovered: progressStats.topicsLearned,
                quizScore: `${progressStats.averageScore}%`,
                streak: progressStats.streak,
              },
            });
          }
        } catch (error) {
          console.error("Error fetching progress data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }

    if (user && !isUserLoading) {
      fetchData();
    }
  }, [user, isUserLoading]);

  // Handle PDF download
  const handleDownloadReport = async () => {
    if (!user) return;

    try {
      setIsDownloading(true);

      // Dynamically import jsPDF and the PDF generator
      const { jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      // Create a new PDF document
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 128); // Dark blue
      doc.text("Learning Progress Report", 105, 15, { align: "center" });

      // Add user info
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0); // Black
      doc.text(`User: ${user.name || user.email || "Anonymous"}`, 20, 25);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 32);

      // Add summary section
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 128); // Dark blue
      doc.text("Summary", 20, 45);

      // Add summary table
      autoTable(doc, {
        startY: 50,
        head: [["Metric", "Value"]],
        body: [
          ["Total Study Time", progressData.stats.studyTime],
          ["Current Streak", `${progressData.stats.streak} days`],
          ["Topics Covered", `${progressData.stats.topicsCovered}`],
          ["Average Quiz Score", progressData.stats.quizScore],
        ],
        theme: "grid",
        headStyles: { fillColor: [0, 0, 128], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [240, 240, 255] },
      });

      // Get the final Y position of the previous table
      const finalY1 = (doc as any).lastAutoTable.finalY;

      // Add weekly progress section
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 128); // Dark blue
      doc.text("Weekly Progress", 20, finalY1 + 15);

      // Add weekly progress table
      const weeklyTableData = progressData.weeklyProgress.map((day) => [
        day.day,
        `${day.minutes} minutes`,
        day.topics,
      ]);

      autoTable(doc, {
        startY: finalY1 + 20,
        head: [["Day", "Study Time", "Topics"]],
        body: weeklyTableData,
        theme: "grid",
        headStyles: { fillColor: [0, 0, 128], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [240, 240, 255] },
      });

      // Get the final Y position of the previous table
      const finalY2 = (doc as any).lastAutoTable.finalY;

      // Add subject progress section
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 128); // Dark blue
      doc.text("Subject Progress", 20, finalY2 + 15);

      // Add subject progress table
      const subjectTableData = progressData.subjectProgress.map((subject) => [
        subject.subject,
        `${subject.progress}%`,
      ]);

      autoTable(doc, {
        startY: finalY2 + 20,
        head: [["Subject", "Progress"]],
        body: subjectTableData,
        theme: "grid",
        headStyles: { fillColor: [0, 0, 128], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [240, 240, 255] },
      });

      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Page ${i} of ${pageCount} - Generated on ${new Date().toLocaleString()}`,
          105,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
      }

      // Save the PDF
      doc.save(`progress-report-${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Error downloading report:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Progress</h1>
          <p className="text-muted-foreground">
            Track your learning journey and achievements
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-1"
          onClick={handleDownloadReport}
          disabled={isDownloading || isLoading}
        >
          {isDownloading ? "Generating..." : "Download Report"}
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>

      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-2 md:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-primary/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Study Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {progressData.stats.studyTime}
                      </div>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {parseInt(progressData.stats.studyTime) > 0
                        ? "Keep up the good work!"
                        : "Start studying to track your time"}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-primary/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Topics Covered
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {progressData.stats.topicsCovered}
                      </div>
                      <BarChart2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {progressData.stats.topicsCovered > 0
                        ? "Expanding your knowledge!"
                        : "Explore topics to learn more"}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-primary/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Quiz Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {progressData.stats.quizScore}
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {parseInt(progressData.stats.quizScore) > 0
                        ? "Great progress on quizzes!"
                        : "Take quizzes to test your knowledge"}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-primary/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Current Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {progressData.stats.streak} days
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {progressData.stats.streak > 0
                        ? "Keep it going!"
                        : "Study daily to build a streak"}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Weekly Progress Chart */}
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle>Weekly Study Progress</CardTitle>
              <CardDescription>
                Your study time and topics covered this week
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="animate-pulse space-y-4 w-full">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mx-auto"></div>
                    <div className="h-[250px] bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                  </div>
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={progressData.weeklyProgress}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="minutes"
                        stroke="#8884d8"
                        name="Minutes"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="topics"
                        stroke="#82ca9d"
                        name="Topics"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subject Progress */}
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle>Subject Progress</CardTitle>
              <CardDescription>
                Your progress across different subjects
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="animate-pulse space-y-4 w-full">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mx-auto"></div>
                    <div className="h-[250px] bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                  </div>
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={progressData.subjectProgress}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="progress"
                        fill="hsl(var(--primary))"
                        name="Progress"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Motivational Card */}
          <Card className="border-primary/10">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-16 w-16 text-primary animate-pulse" />
                  <div
                    className="absolute inset-0 rounded-full border-4 border-primary/30 border-t-primary animate-spin"
                    style={{ animationDuration: "3s" }}
                  ></div>
                </div>
                <h3 className="text-xl font-bold mt-4">Keep Learning!</h3>
                <p className="text-sm text-foreground/70 max-w-md">
                  You're making great progress. Continue your learning journey
                  to unlock more achievements and master new topics.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          {/* Achievements */}
          <AchievementsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
