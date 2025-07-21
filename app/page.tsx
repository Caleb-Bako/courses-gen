"use client"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MessageSquare, Clock, Brain, ArrowRight, GraduationCap } from "lucide-react"
import Link from "next/link"
// import Logic from "./mycomponents/ChoiceLogic";

export default function Home() {
  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI-Powered Study Planning for
            <span className="text-blue-600"> Smart Students</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Generate personalized timetables and manage carry-over courses with intelligent AI assistance. Optimize your
            study schedule based on course intensity and learning patterns.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/dashboard">
              <Button size="lg" className="px-8 py-3">
                Start Demo Now
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg" className="px-8 py-3 bg-transparent">
                View Documetation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Features - Two Sectors */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Two Powerful Tools for Academic Success</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose the right tool for your academic needs - whether you need a personalized study timetable or help
            managing carry-over courses.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Timetable Generator Sector */}
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow p-8 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto mb-6 p-4 bg-blue-600 rounded-full w-20 h-20 flex items-center justify-center">
                <Calendar className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl mb-4">Timetable Generator</CardTitle>
              <CardDescription className="text-base">
                Create AI-optimized study schedules in 3 simple steps
              </CardDescription>
            </CardHeader>

            {/* 3-Step Process */}
            <div className="space-y-6 mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Input Courses</h4>
                  <p className="text-sm text-gray-600">Add courses with intensity and category</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Chat with AI</h4>
                  <p className="text-sm text-gray-600">Get personalized study time recommendations</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Generate Timetable</h4>
                  <p className="text-sm text-gray-600">Get your optimized weekly schedule</p>
                </div>
              </div>
            </div>

            <Link href="/timetable-generator" className="block">
              <Button className="w-full" size="lg">
                Create Timetable
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </Card>

          {/* Carry-over Course Management Sector */}
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow p-8 bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto mb-6 p-4 bg-green-600 rounded-full w-20 h-20 flex items-center justify-center">
                <GraduationCap className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl mb-4">Carry-over Management</CardTitle>
              <CardDescription className="text-base">Smart course selection within credit unit limits</CardDescription>
            </CardHeader>

            {/* Features */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm">Credit unit tracking and limits</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm">Course prerequisite validation</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm">AI-powered course recommendations</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm">Semester planning optimization</span>
              </div>
            </div>

            <Link href="/course-management" className="block">
              <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
                Manage Courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Additional Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Powered by Advanced AI</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow text-center p-6">
            <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <CardTitle className="mb-2">Smart Scheduling</CardTitle>
            <CardDescription>
              AI analyzes course difficulty and your learning patterns to create optimal study schedules.
            </CardDescription>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow text-center p-6">
            <MessageSquare className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <CardTitle className="mb-2">Interactive Chat</CardTitle>
            <CardDescription>
              Collaborate with AI to fine-tune your schedule and get personalized study recommendations.
            </CardDescription>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow text-center p-6">
            <Clock className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <CardTitle className="mb-2">Time Optimization</CardTitle>
            <CardDescription>
              Maximize productivity by scheduling intensive courses during your peak focus hours.
            </CardDescription>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Study Schedule?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of students who have improved their academic performance with StudyPlan AI.
          </p>
          <Link href="/dashboard">
            <Button size="lg" variant="secondary" className="px-8 py-3">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Calendar className="h-6 w-6" />
            <span className="text-xl font-bold">StudyPlan AI</span>
          </div>
          <p className="text-gray-400">© 2024 StudyPlan AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
