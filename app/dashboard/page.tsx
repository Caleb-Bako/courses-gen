import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, BookOpen, MessageSquare, Clock, User, Settings, Bell, ArrowRight, GraduationCap } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">StudyPlan AI</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, John!</h1>
          <p className="text-gray-600">Choose your tool to get started with academic planning.</p>
        </div>

        {/* Main Tools - Two Sectors */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Timetable Generator */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Timetable Generator</CardTitle>
                  <CardDescription>Create your personalized study schedule</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span>Timetable Status</span>
                  <span className="text-blue-600 font-medium">Ready to start</span>
                </div>
                <Progress value={0} className="h-2" />
                <p className="text-sm text-gray-600">
                  Start by adding your courses with their intensity levels and categories.
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs">1</div>
                  <span>Add Courses</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs">2</div>
                  <span>Chat with AI</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs">3</div>
                  <span>Generate Timetable</span>
                </div>
              </div>

              <Link href="/timetable-generator">
                <Button className="w-full">
                  Continue Timetable
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Course Management */}
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-green-600 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Course Management</CardTitle>
                  <CardDescription>Manage carry-over courses and credit limits</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span>Credit Usage</span>
                  <span className="text-green-600 font-medium">18/24 units</span>
                </div>
                <Progress value={75} className="h-2" />
                <p className="text-sm text-gray-600">
                  You have 6 credit units remaining. 3 carry-over courses available.
                </p>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span>Registered Courses</span>
                  <Badge variant="secondary">8 courses</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Carry-over Courses</span>
                  <Badge variant="outline" className="text-orange-600 border-orange-200">
                    3 available
                  </Badge>
                </div>
              </div>

              <Link href="/course-management">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Manage Courses
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Timetables</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">Generated this semester</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credit Units</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18/24</div>
              <p className="text-xs text-muted-foreground">6 units remaining</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Sessions</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">Chat conversations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Status</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Active</div>
              <p className="text-xs text-muted-foreground">Member since 2024</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Timetables</CardTitle>
              <CardDescription>Your latest generated schedules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Week 1-4 Schedule", courses: 8, created: "2 days ago", status: "Active" },
                  { name: "Midterm Prep Schedule", courses: 6, created: "1 week ago", status: "Completed" },
                  { name: "Final Exam Schedule", courses: 8, created: "2 weeks ago", status: "Draft" },
                ].map((timetable, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{timetable.name}</h4>
                      <p className="text-sm text-gray-600">
                        {timetable.courses} courses • {timetable.created}
                      </p>
                    </div>
                    <Badge variant={timetable.status === "Active" ? "default" : "secondary"}>{timetable.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent AI Chats</CardTitle>
              <CardDescription>Your latest conversations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: "Study Time Optimization", messages: 12, time: "2 hours ago" },
                  { title: "Course Difficulty Analysis", messages: 8, time: "1 day ago" },
                  { title: "Schedule Adjustments", messages: 15, time: "3 days ago" },
                ].map((chat, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div>
                      <h4 className="font-medium text-sm">{chat.title}</h4>
                      <p className="text-xs text-gray-600">{chat.time}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {chat.messages}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
