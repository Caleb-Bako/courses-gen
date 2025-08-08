'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, BookOpen, MessageSquare, Clock, ArrowRight, GraduationCap } from "lucide-react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import {
  AnimatedWrapper,
  AnimatedIcon,
  AnimatedButton,
  AnimatedCard,
  AnimatedProgress,
} from "@/components/animations/dashboardanimation"
import { Badge } from "@/components/ui/badge"
import LoadingThreeDotsJumping from "@/components/animations/loading"
import { userSession } from "@/components/SupabaseFunctions/Retrieve/retrieveUserData"

export default function DashboardPage() {
  const { user } = useUser()
  const [history, setHistory] = useState<any[]>([])
  const [session, setSession] = useState<any[]>([])
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [loading,setLoading] = useState<Boolean>(false)
  function isLoading(){
      setLoading(true)
    }

  useEffect(() => {
    const fetchData = async () => {
      const stepFromStorage = localStorage.getItem("steps-data")
      if (stepFromStorage) {
        const{step} = JSON.parse(stepFromStorage)
        setCurrentStep(parseInt(step))
        console.log("Step: ",step)

      }
      const userId = user?.id
      if (!userId) return

      const historyData = await userSession(userId,"chat_sessions","user_id")
      setHistory(historyData || [])

      const sessionData = await userSession(userId,"student_courses","chat_id")
      setSession(sessionData || [])
    }

    if (user) fetchData()
  }, [user])



  return (
    <div className="min-h-screen bg-gray-50">
      {loading ? <LoadingThreeDotsJumping color="#2555f5ff"/> :(
      <div className="container mx-auto px-4 py-8">
        <AnimatedWrapper variant="staggerContainer">
          <AnimatedWrapper variant="fadeInUp">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.firstName}!</h1>
              <p className="text-gray-600">Choose your tool to get started with academic planning.</p>
            </div>
          </AnimatedWrapper>
        </AnimatedWrapper>

        {/* Main Tools */}
        <AnimatedWrapper variant="staggerContainer">
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
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
                    <AnimatedProgress value={(currentStep / 3) * 100} className="h-2" color="blue"/>
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
                      <Button onClick={isLoading} className="w-full cursor-pointer bg-blue-500 hover:bg-blue-700 group-hover:bg-blue-700 transition-colors">
                        {currentStep>=1 ? "Continue Timetable":"Create Timetable"}
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
        <AnimatedProgress value={75} className="h-2 text-bg-500" color="green" />
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
      <Link href="/courses-management">
        <AnimatedButton className="w-full">
          <Button 
          onClick={isLoading} 
          className="w-full bg-green-600 hover:bg-green-700 cursor-pointer group-hover:bg-green-700 transition-colors">
            Manage Courses
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </AnimatedButton>
      </Link>
    </CardContent>
  </Card>
</AnimatedCard>

            {/* Get Courses */}
      <AnimatedCard>
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 group hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <div className="flex items-center space-x-3 mb-4">
              <AnimatedIcon className="p-3 bg-purple-600 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </AnimatedIcon>
              <div>
                <CardTitle className="text-xl">Search Courses</CardTitle>
                <CardDescription>
                  Don&apos;t know which courses you have for a semester. Come on down and get them
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span>Recorded Universities</span>
                <span className="text-purple-600 font-medium">--/--</span>
              </div>
              <AnimatedProgress value={75} className="h-2 text-bg-500" color="purple" />
              <p className="text-sm text-gray-600">
                -- Nigerian Universities Recorded with their departments and courses up-to-date.
              </p>
            </div>

            <AnimatedWrapper variant="staggerContainer">
              <div className="space-y-2 mb-6">
                <AnimatedWrapper variant="slideInLeft">
                  <div className="flex items-center justify-between text-sm">
                    <span>Recorded Departments</span>
                    <Badge variant="secondary">-- Departments</Badge>
                  </div>
                </AnimatedWrapper>
                <AnimatedWrapper variant="slideInLeft" delay={0.1}>
                  <div className="flex items-center justify-between text-sm">
                    <span>Recorded Courses</span>
                    <Badge variant="outline" className="text-orange-600 border-orange-200">
                      -- available
                    </Badge>
                  </div>
                </AnimatedWrapper>
              </div>
            </AnimatedWrapper>

            <Link href="/courses">
              <AnimatedButton className="w-full">
                <Button onClick={isLoading} className="w-full bg-purple-500 hover:from-purple-100 hover:to-purple-150 cursor-pointer group-hover:bg-purple-700 transition-colors">
                  Get Courses
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
                subtitle: "Member since 2025",
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

        {/* Recent Chats */}
        <AnimatedWrapper variant="fadeInUp" delay={0.8}>
          <Card className="hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Recent AI Chats</CardTitle>
              <CardDescription>Your latest conversations</CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatedWrapper variant="staggerContainer">
                <div className="space-y-4">
                  {history?.slice(0, 5).map((chat, index) => (
                    <AnimatedWrapper key={index} variant="slideInLeft" delay={index * 0.1}>
                      <Link
                        href={`/chat/${chat.id}`}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer group"
                      >
                        <div className="flex-1" onClick={isLoading}>
                          <h4 className="font-medium text-sm group-hover:text-blue-600 transition-colors">
                            {chat.title}
                          </h4>
                          <p className="text-xs text-gray-600">{new Date(chat.created_at).toLocaleDateString()}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </AnimatedWrapper>
                  ))}
                </div>
              </AnimatedWrapper>
            </CardContent>
          </Card>
        </AnimatedWrapper>
      </div>
      )}
    </div>
  )
}

//GIVE FULL LIST OF UNI
//COURSES LIST OF UNI
//Whats the pitch...whats the selling idea..what is it trying to achieve
//Loading function accepting colors
//NavBar
//Title Creation for chats => user first prompt + number of chat + 1
//Supabase and Clerk Auth --> Read on Supabase RLS
//look at localStorage
//Courses search bar
//Documentation
//reduce headers and input place holders font size 
//adjust course management form size