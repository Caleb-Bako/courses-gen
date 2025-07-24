import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, BookOpen, MessageSquare, Clock, ArrowRight, GraduationCap } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/supabaseClient"
import { auth, currentUser } from "@clerk/nextjs/server"
import {
  AnimatedWrapper,
  AnimatedIcon,
  AnimatedButton,
  AnimatedCard,
  AnimatedProgress,
} from "@/components/animations/dashboardanimation"

export default async function DashboardPage() {
  const { userId } = await auth()
  const user = await currentUser()
  const currentStep = 2

  const { data: history } = await supabase.from("chat_sessions").select().eq("user_id", userId)

  const { data: session } = await supabase.from("student_courses").select().eq("chat_id", userId)

  console.log("Gotten", history)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <AnimatedWrapper variant="staggerContainer">
          <AnimatedWrapper variant="fadeInUp">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.firstName}!</h1>
              <p className="text-gray-600">Choose your tool to get started with academic planning.</p>
            </div>
          </AnimatedWrapper>
        </AnimatedWrapper>

        {/* Main Tools - Two Sectors */}
        <AnimatedWrapper variant="staggerContainer">
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Timetable Generator */}
            <AnimatedCard>
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-4">
                    <AnimatedIcon className="p-3 bg-blue-600 rounded-lg">
                      <Calendar className="h-6 w-6 text-white" />
                    </AnimatedIcon>
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
                    <AnimatedProgress value={(currentStep / 3) * 100} className="h-2" />
                    <p className="text-sm text-gray-600">
                      Start by adding your courses with their intensity levels and categories.
                    </p>
                  </div>

                  <AnimatedWrapper variant="staggerContainer">
                    <div className="space-y-3 mb-6">
                      {[
                        { step: 1, text: "Add Courses", active: currentStep >= 1 },
                        { step: 2, text: "Chat with AI", active: currentStep >= 2 },
                        { step: 3, text: "Generate Timetable", active: currentStep >= 3 },
                      ].map((item, index) => (
                        <AnimatedWrapper key={index} variant="slideInLeft" delay={index * 0.1}>
                          <div className="flex items-center space-x-2 text-sm">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${
                                item.active ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
                              }`}
                            >
                              {item.step}
                            </div>
                            <span className={item.active ? "text-blue-600" : "text-gray-400"}>{item.text}</span>
                          </div>
                        </AnimatedWrapper>
                      ))}
                    </div>
                  </AnimatedWrapper>

                  <Link href="/timetable-generator">
                    <AnimatedButton className="w-full">
                      <Button className="w-full cursor-pointer group-hover:bg-blue-700 transition-colors">
                        Create Timetable
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </AnimatedButton>
                  </Link>
                </CardContent>
              </Card>
            </AnimatedCard>

            {/* Course Management */}
            <AnimatedCard>
              <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-4">
                    <AnimatedIcon className="p-3 bg-green-600 rounded-lg">
                      <GraduationCap className="h-6 w-6 text-white" />
                    </AnimatedIcon>
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
                      <span className="text-green-600 font-medium">--/-- units</span>
                    </div>
                    <AnimatedProgress value={75} className="h-2" />
                    <p className="text-sm text-gray-600">
                      You have -- credit units remaining. -- carry-over courses available.
                    </p>
                  </div>

                  <AnimatedWrapper variant="staggerContainer">
                    <div className="space-y-2 mb-6">
                      <AnimatedWrapper variant="slideInLeft">
                        <div className="flex items-center justify-between text-sm">
                          <span>Registered Courses</span>
                          <Badge variant="secondary">-- courses</Badge>
                        </div>
                      </AnimatedWrapper>
                      <AnimatedWrapper variant="slideInLeft" delay={0.1}>
                        <div className="flex items-center justify-between text-sm">
                          <span>Carry-over Courses</span>
                          <Badge variant="outline" className="text-orange-600 border-orange-200">
                            -- available
                          </Badge>
                        </div>
                      </AnimatedWrapper>
                    </div>
                  </AnimatedWrapper>

                  <Link href="/course-management">
                    <AnimatedButton className="w-full">
                      <Button className="w-full bg-green-600 hover:bg-green-700 cursor-pointer group-hover:bg-green-700 transition-colors">
                        Manage Courses
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </AnimatedButton>
                  </Link>
                </CardContent>
              </Card>
            </AnimatedCard>
          </div>
        </AnimatedWrapper>

        {/* Stats Overview */}
        <AnimatedWrapper variant="staggerContainer">
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: "Active Timetables",
                value: session?.length || 0,
                subtitle: "Generated this semester",
                icon: Calendar,
                color: "text-blue-600",
              },
              {
                title: "Credit Units",
                value: "--/--",
                subtitle: "-- units remaining",
                icon: BookOpen,
                color: "text-green-600",
              },
              {
                title: "AI Sessions",
                value: history?.length || 0,
                subtitle: "Chat conversations",
                icon: MessageSquare,
                color: "text-purple-600",
              },
              {
                title: "Account Status",
                value: "Active",
                subtitle: "Member since 2024",
                icon: Clock,
                color: "text-orange-600",
              },
            ].map((stat, index) => (
              <AnimatedCard key={index}>
                <Card className="hover:shadow-md transition-all duration-300 group">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <AnimatedIcon>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </AnimatedIcon>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                  </CardContent>
                </Card>
              </AnimatedCard>
            ))}
          </div>
        </AnimatedWrapper>

        {/* Recent Activity */}
        <AnimatedWrapper variant="fadeInUp" delay={0.8}>
          <Card className="hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Recent AI Chats</CardTitle>
              <CardDescription>Your latest conversations</CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatedWrapper variant="staggerContainer">
                <div className="space-y-4">
                  {history?.map((chat, index) => (
                    <AnimatedWrapper key={index} variant="slideInLeft" delay={index * 0.1}>
                      <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer group">
                        <Link href={`/chat/${chat.id}`} className="flex-1">
                          <h4 className="font-medium text-sm group-hover:text-blue-600 transition-colors">
                            {chat.title}
                          </h4>
                          <p className="text-xs text-gray-600">{new Date(chat.created_at).toLocaleDateString()}</p>
                        </Link>
                        <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </AnimatedWrapper>
                  ))}
                </div>
              </AnimatedWrapper>
            </CardContent>
          </Card>
        </AnimatedWrapper>
      </div>
    </div>
  )
}


//progress bar based on what is in local storage
//Number of chats and timetables
//arrange the chats and timetable to be most recents(5 max to be shown)
//link clerk to supabase auth 
//Add Department and level for adding courses
//Use collection of courses to create possible list of courses based on department and level 
//Logic is if course appears more than 3 in courses for timetable then it will appear to the list 
//List of Courses for each department 