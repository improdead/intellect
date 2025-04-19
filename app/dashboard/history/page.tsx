import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Learning History</h1>
        <p className="text-muted-foreground">Track your learning progress and activities</p>
      </div>

      <Tabs defaultValue="recent" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Learning Activities</CardTitle>
              <CardDescription>Your learning activities from the past 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {[
                  {
                    date: "Today",
                    activities: [
                      {
                        title: "Completed lesson: Quantum Mechanics - Wave Functions",
                        time: "10:30 AM",
                        category: "Physics",
                        type: "lesson",
                      },
                      {
                        title: "Started quiz: Calculus Integration Methods",
                        time: "9:15 AM",
                        category: "Mathematics",
                        type: "quiz",
                      },
                    ],
                  },
                  {
                    date: "Yesterday",
                    activities: [
                      {
                        title: "Completed lesson: Organic Chemistry - Functional Groups",
                        time: "2:00 PM",
                        category: "Chemistry",
                        type: "lesson",
                      },
                      {
                        title: "Watched video: Introduction to Cell Biology",
                        time: "11:45 AM",
                        category: "Biology",
                        type: "video",
                      },
                    ],
                  },
                  {
                    date: "Last Week",
                    activities: [
                      {
                        title: "Earned achievement: Physics Master",
                        time: "Friday, 3:20 PM",
                        category: "Achievements",
                        type: "achievement",
                      },
                      {
                        title: "Completed course: Introduction to Calculus",
                        time: "Wednesday, 1:15 PM",
                        category: "Mathematics",
                        type: "course",
                      },
                    ],
                  },
                ].map((day, i) => (
                  <div key={i} className="space-y-4">
                    <h3 className="font-medium text-sm text-muted-foreground">{day.date}</h3>
                    <div className="space-y-3">
                      {day.activities.map((activity, j) => (
                        <div key={j} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                          <div
                            className={`h-2 w-2 mt-2 rounded-full flex-shrink-0 ${
                              activity.type === "lesson"
                                ? "bg-blue-500"
                                : activity.type === "quiz"
                                  ? "bg-amber-500"
                                  : activity.type === "video"
                                    ? "bg-green-500"
                                    : "bg-purple-500"
                            }`}
                          />
                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
                              <p className="font-medium">{activity.title}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-primary/5">
                                  {activity.category}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{activity.time}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quiz History</CardTitle>
              <CardDescription>Your quiz results and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: "Quantum Physics - Wave Particle Duality",
                    date: "June 15, 2023",
                    score: "85%",
                    status: "Passed",
                  },
                  {
                    title: "Calculus - Integration Methods",
                    date: "June 10, 2023",
                    score: "92%",
                    status: "Passed",
                  },
                  {
                    title: "Organic Chemistry - Functional Groups",
                    date: "May 28, 2023",
                    score: "78%",
                    status: "Passed",
                  },
                  {
                    title: "Classical Mechanics - Newton's Laws",
                    date: "May 15, 2023",
                    score: "65%",
                    status: "Failed",
                  },
                ].map((quiz, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{quiz.title}</p>
                      <p className="text-sm text-muted-foreground">Taken on {quiz.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-medium">{quiz.score}</p>
                        <p className={`text-xs ${quiz.status === "Passed" ? "text-green-500" : "text-red-500"}`}>
                          {quiz.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Achievements</CardTitle>
              <CardDescription>Badges and milestones you've earned</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    title: "Physics Master",
                    description: "Completed all core physics courses with an average score of 90% or higher",
                    date: "June 12, 2023",
                    icon: "🏆",
                  },
                  {
                    title: "Math Wizard",
                    description: "Solved 100 complex mathematical problems correctly",
                    date: "May 20, 2023",
                    icon: "🧙‍♂️",
                  },
                  {
                    title: "Consistent Learner",
                    description: "Logged in and studied for 30 consecutive days",
                    date: "April 15, 2023",
                    icon: "🔥",
                  },
                  {
                    title: "Quiz Champion",
                    description: "Achieved perfect scores on 10 different quizzes",
                    date: "March 28, 2023",
                    icon: "🎯",
                  },
                  {
                    title: "Early Bird",
                    description: "Completed 20 lessons before 8:00 AM",
                    date: "March 10, 2023",
                    icon: "🌅",
                  },
                ].map((achievement, i) => (
                  <Card key={i} className="border bg-card">
                    <CardHeader className="pb-2">
                      <div className="text-center text-4xl mb-2">{achievement.icon}</div>
                      <CardTitle className="text-center">{achievement.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-center text-muted-foreground mb-2">{achievement.description}</p>
                      <p className="text-xs text-center text-muted-foreground">Earned on {achievement.date}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
