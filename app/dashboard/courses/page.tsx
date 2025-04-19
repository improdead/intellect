import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Courses</h1>
        <p className="text-muted-foreground">Manage and track your enrolled courses</p>
      </div>

      <Tabs defaultValue="enrolled" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="enrolled">Enrolled</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
        </TabsList>

        <TabsContent value="enrolled" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Introduction to Quantum Physics",
                description: "Learn the fundamentals of quantum mechanics and its applications.",
                progress: 65,
                category: "Physics",
                level: "Intermediate",
              },
              {
                title: "Advanced Calculus",
                description: "Master differential equations and multivariable calculus.",
                progress: 32,
                category: "Mathematics",
                level: "Advanced",
              },
              {
                title: "Organic Chemistry Fundamentals",
                description: "Understand the principles of organic chemistry and molecular structures.",
                progress: 78,
                category: "Chemistry",
                level: "Beginner",
              },
            ].map((course, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {course.category}
                    </Badge>
                    <Badge variant="outline">{course.level}</Badge>
                  </div>
                  <CardTitle className="mt-2">{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Continue Learning</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Classical Mechanics",
                description: "Understanding Newton's laws and their applications in physics.",
                category: "Physics",
                level: "Beginner",
                completedDate: "June 15, 2023",
              },
              {
                title: "Linear Algebra",
                description: "Vectors, matrices, and linear transformations in mathematics.",
                category: "Mathematics",
                level: "Intermediate",
                completedDate: "April 22, 2023",
              },
            ].map((course, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {course.category}
                    </Badge>
                    <Badge variant="outline">{course.level}</Badge>
                  </div>
                  <CardTitle className="mt-2">{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Completed on: <span className="font-medium">{course.completedDate}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View Certificate
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommended" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Quantum Field Theory",
                description: "Advanced study of quantum mechanics and field theory.",
                category: "Physics",
                level: "Advanced",
              },
              {
                title: "Statistical Analysis",
                description: "Learn how to analyze and interpret complex data sets.",
                category: "Mathematics",
                level: "Intermediate",
              },
              {
                title: "Biochemistry",
                description: "Study the chemical processes within living organisms.",
                category: "Biology",
                level: "Intermediate",
              },
            ].map((course, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {course.category}
                    </Badge>
                    <Badge variant="outline">{course.level}</Badge>
                  </div>
                  <CardTitle className="mt-2">{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">Recommended based on your learning history</div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Enroll Now</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
