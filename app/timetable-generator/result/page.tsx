"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  ArrowLeft,
  Download,
  Share2,
  RefreshCw,
  Clock,
  BookOpen,
  CheckCircle2,
  MessageSquare,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/supabaseClient"

type Weekday = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
interface Course {
    name: string;
    day: Weekday;
    time?: string
    category: 'calculation' | 'coding' | 'theory';
    intensity: 'hard' | 'easy' | 'mid' | 'hard-to-grasp' | 'bulky' | 'both-hard-bulky';
    startTime?: string;
    endTime?: string;
}
interface Extract{
  Day:string; Course: string; Start: string; End: string
}
interface Table{
  Courses:Course[];
  Priority_Grouped:Course[];
  schedule:  Record<Weekday, Extract[]>;
}

export default function TimetableResultPage() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [timeTable,setTimeTable] = useState<Table[]>([]);

  const timeSlots = [
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM",
  ]

 const days: Weekday[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];


  const timetableData = {
    Monday: {
      "8:00 AM": {
        course: "Advanced Mathematics",
        code: "MTH 301",
        intensity: "hard",
        type: "study",
        duration: "2 hours",
      },
      "10:15 AM": { course: "Statistics", code: "STA 301", intensity: "medium", type: "study", duration: "1.5 hours" },
      "2:00 PM": {
        course: "Computer Programming",
        code: "CSC 201",
        intensity: "medium",
        type: "study",
        duration: "2 hours",
      },
      "4:15 PM": {
        course: "Physics Laboratory",
        code: "PHY 202",
        intensity: "easy",
        type: "practical",
        duration: "1 hour",
      },
    },
    Tuesday: {
      "8:00 AM": {
        course: "Advanced Mathematics",
        code: "MTH 301",
        intensity: "hard",
        type: "practice",
        duration: "1.5 hours",
      },
      "10:00 AM": { course: "Statistics", code: "STA 301", intensity: "medium", type: "practice", duration: "1 hour" },
      "2:00 PM": { course: "Light Classes", code: "", intensity: "", type: "classes", duration: "Afternoon" },
      "5:00 PM": {
        course: "Computer Programming",
        code: "CSC 201",
        intensity: "medium",
        type: "project",
        duration: "1 hour",
      },
    },
    Wednesday: {
      "8:00 AM": {
        course: "Advanced Mathematics",
        code: "MTH 301",
        intensity: "hard",
        type: "study",
        duration: "2 hours",
      },
      "10:15 AM": { course: "Statistics", code: "STA 301", intensity: "medium", type: "study", duration: "1.5 hours" },
      "2:00 PM": {
        course: "Computer Programming",
        code: "CSC 201",
        intensity: "medium",
        type: "study",
        duration: "2 hours",
      },
      "5:00 PM": { course: "Math Review", code: "MTH 301", intensity: "hard", type: "review", duration: "1 hour" },
    },
    Thursday: {
      "8:00 AM": { course: "Statistics", code: "STA 301", intensity: "medium", type: "study", duration: "1.5 hours" },
      "10:00 AM": {
        course: "Physics Laboratory",
        code: "PHY 202",
        intensity: "easy",
        type: "lab",
        duration: "2 hours",
      },
      "2:00 PM": { course: "Light Classes", code: "", intensity: "", type: "classes", duration: "Afternoon" },
      "5:00 PM": {
        course: "Statistics Practice",
        code: "STA 301",
        intensity: "medium",
        type: "practice",
        duration: "1 hour",
      },
    },
    Friday: {
      "8:00 AM": {
        course: "Advanced Mathematics",
        code: "MTH 301",
        intensity: "hard",
        type: "practice",
        duration: "1.5 hours",
      },
      "10:00 AM": {
        course: "Computer Programming",
        code: "CSC 201",
        intensity: "medium",
        type: "study",
        duration: "2 hours",
      },
      "2:00 PM": {
        course: "Statistics Practice",
        code: "STA 301",
        intensity: "medium",
        type: "review",
        duration: "1 hour",
      },
      "4:00 PM": {
        course: "Physics Laboratory",
        code: "PHY 202",
        intensity: "easy",
        type: "report",
        duration: "1 hour",
      },
    },
    Saturday: {
      "9:00 AM": { course: "Weekly Review", code: "ALL", intensity: "", type: "review", duration: "2 hours" },
      "2:00 PM": {
        course: "Programming Projects",
        code: "CSC 201",
        intensity: "medium",
        type: "project",
        duration: "2 hours",
      },
      "5:00 PM": { course: "Catch-up Session", code: "ALL", intensity: "", type: "catchup", duration: "1 hour" },
    },
    Sunday: {
      "10:00 AM": { course: "Light Review", code: "ALL", intensity: "", type: "review", duration: "1 hour" },
      "2:00 PM": {
        course: "Physics Lab Reports",
        code: "PHY 202",
        intensity: "easy",
        type: "report",
        duration: "1 hour",
      },
      "4:00 PM": { course: "Next Week Prep", code: "ALL", intensity: "", type: "planning", duration: "1 hour" },
    },
  }


  //Getting data
    useEffect(()=>{
       const saved = localStorage.getItem('Table');
       if(saved){
         const {tableId} = JSON.parse(saved);
        console.log("Table ID Gotten:",tableId)
        getTimeTable(tableId)
        // setStored(sessionId);
       }
    },[])

    const getTimeTable = async (id:string) => {
        const { data: table, error } = await supabase
        .from("student_courses")
        .select("Courses, Priority_Grouped, schedule")
        .eq("id", id);

        if(table){
            setTimeTable(table);
            console.log("DONE!!!",timeTable)
        }
    }

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "hard":
        return "bg-red-100 border-red-200 text-red-800"
      case "hard-to-grasp" :
        return "bg-red-100 border-red-200 text-red-800"
      case "mid":
        return "bg-yellow-100 border-yellow-200 text-yellow-800"
      case "easy":
        return "bg-green-100 border-green-200 text-green-800"
      case "bulky":
         return "bg-yellow-100 border-yellow-200 text-yellow-800"
      case "both-hard-bulky"  :
        "bg-red-100 border-red-200 text-red-800"
      default:
        return "bg-blue-100 border-blue-200 text-blue-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "study":
        return "📚"
      case "practice":
        return "✏️"
      case "lab":
        return "🔬"
      case "project":
        return "💻"
      case "review":
        return "📖"
      case "classes":
        return "🏫"
      case "report":
        return "📝"
      case "catchup":
        return "⚡"
      case "planning":
        return "📋"
      default:
        return "📅"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/timetable-generator">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Generator
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-green-600" />
              <span className="text-xl font-bold text-gray-900">Generated Timetable</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate
            </Button>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Success Message */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <CheckCircle2 className="h-6 w-6" />
              <span>Timetable Generated Successfully!</span>
            </CardTitle>
            <CardDescription className="text-green-700">
              Your personalized study schedule has been created based on your course intensity levels and AI
              recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-green-600" />
                <span className="text-sm">Courses optimized</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="text-sm">1-3 hours daily study time</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-green-600" />
                <span className="text-sm">AI recommendations applied</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timetable Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Your Personalized Weekly Schedule</CardTitle>
            <CardDescription>
              Color-coded by course intensity: Red (Hard), Yellow (Medium), Green (Easy), Blue (Special Activities)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                {timeTable.length > 0 ? (
                  timeTable.map((tableEntry, index) => (
                    <div key={index}>
                      {/* Grid with 7 columns for days */}
                      <div className="grid grid-cols-7 gap-4">
                        {days.map((day) => {
                          const dailyEntries = tableEntry.schedule[day as Weekday] || [];

                          return (
                            <div key={day} className="bg-gray-50 border rounded p-2 min-h-[100px]">
                              <div className="text-center font-semibold text-sm mb-2 text-blue-800">
                                {day}
                              </div>
                              <div className="space-y-2">
                                {dailyEntries.length > 0 ? (
                                  dailyEntries.map((item, i) => (
                                    <div
                                      key={i}
                                      className={`rounded border p-2 text-xs ${getIntensityColor(
                                        item.Course.toLowerCase()
                                      )}`}
                                    >
                                      <div className="font-medium">{item.Course}</div>
                                      <div className="opacity-75">{item.Start} - {item.End}</div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-center text-gray-400 text-xs py-4 border-2 border-dashed rounded">
                                    No classes
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-gray-500 py-4">
                    Loading schedule or no schedule available...
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Course Summary</CardTitle>
            <CardDescription>Weekly time allocation for each course</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  name: "Advanced Mathematics",
                  code: "MTH 301",
                  hours: "8.5 hours/week",
                  intensity: "Hard",
                  sessions: "6 sessions",
                },
                {
                  name: "Computer Programming",
                  code: "CSC 201",
                  hours: "7 hours/week",
                  intensity: "Medium",
                  sessions: "5 sessions",
                },
                {
                  name: "Statistics",
                  code: "STA 301",
                  hours: "6 hours/week",
                  intensity: "Medium",
                  sessions: "5 sessions",
                },
                {
                  name: "Physics Laboratory",
                  code: "PHY 202",
                  hours: "5 hours/week",
                  intensity: "Easy",
                  sessions: "4 sessions",
                },
              ].map((course, index) => (
                <div key={index} className="p-4 border rounded-lg bg-white">
                  <h4 className="font-medium mb-1">{course.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{course.code}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Weekly Time:</span>
                      <span className="font-medium">{course.hours}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Sessions:</span>
                      <span className="font-medium">{course.sessions}</span>
                    </div>
                    <Badge
                      variant={
                        course.intensity === "Hard"
                          ? "destructive"
                          : course.intensity === "Medium"
                            ? "default"
                            : "secondary"
                      }
                      className="mt-2"
                    >
                      {course.intensity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-8">
          <Link href="/timetable-generator/chat">
            <Button variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Modify with AI
            </Button>
          </Link>
          <div className="space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost">Back to Dashboard</Button>
            </Link>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Save Timetable
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

//Getting data for timetbable
//Arranging time based on ascending order
// Set icons for types and color for intensity
//List of courses at the bottom