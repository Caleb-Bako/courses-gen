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
  schedule:  Record<Weekday, Extract[]>;
}

export default function TimetableResultPage() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [timeTable,setTimeTable] = useState<Table[]>([]);
    const [priorityGrouped, setPriorityGrouped] = useState<Record<Weekday, Course[]>>({
            Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday:[],Sunday:[]
    });

 const days: Weekday[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];


  //Getting data
    useEffect(()=>{
       const saved = localStorage.getItem('Table');
       if(saved){
         const {tableId} = JSON.parse(saved);
        console.log("Table ID Gotten:",tableId)
        getTimeTable(tableId)
       }
    },[])

  const getTimeTable = async (id: string) => {
    const { data, error } = await supabase
      .from("student_courses")
      .select("Priority_Grouped, schedule")
      .eq("id", id);

    if (error) {
      console.error("❌ Failed to fetch timetable:", error);
      return;
    }

    if (data && data.length > 0) {
      const entry = data[0];

       setTimeTable([{ schedule: entry.schedule }]);
      setPriorityGrouped(entry.Priority_Grouped as Record<Weekday, Course[]>);

      console.log("✅ Fetched TimeTable and Priority_Grouped:", entry);
    } else {
      console.warn("⚠️ No timetable found for this ID.");
    }
  };


const getIntensityColor = (courseName: string) => {
  let matchedIntensity: Course["intensity"] | undefined;
  const cleanedCourse = courseName.replace(/\s*\(.*?\)\s*/g, '').trim();
  // Search through all days in priorityGrouped
  for (const day of Object.keys(priorityGrouped) as Weekday[]) {
    const course = priorityGrouped[day].find((c) => c.name === cleanedCourse);
    if (course) {
      matchedIntensity = course.intensity;
      break; // Stop searching once we find a match
    }
  }

  switch (matchedIntensity) {
    case "hard":
      return "bg-red-100 border-red-200 text-red-800";
    case "hard-to-grasp":
      return "bg-red-100 border-red-200 text-red-800";
    case "both-hard-bulky":
      return "bg-red-100 border-red-200 text-red-800";
    case "mid":
      return "bg-yellow-100 border-yellow-200 text-yellow-800";
    case "bulky":
      return "bg-yellow-100 border-yellow-200 text-yellow-800";
    case "easy":
      return "bg-green-100 border-green-200 text-green-800";
    default:
      return "bg-blue-100 border-blue-200 text-blue-800";
  }
};

  const getTypeIcon = (courseName: string) => {
      let matchedIntensity: Course["category"] | undefined;
      const cleanedCourse = courseName.replace(/\s*\(.*?\)\s*/g, '').trim();
      // Search through all days in priorityGrouped
      for (const day of Object.keys(priorityGrouped) as Weekday[]) {
        const course = priorityGrouped[day].find((c) => c.name === cleanedCourse);
        if (course) {
          matchedIntensity = course.category;
          break; // Stop searching once we find a match
        }
      }
      switch (matchedIntensity) {
        case "calculation":
          return "✏️"
        case "coding":
          return "💻"
        case "theory":
          return "📖"
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
                                        item.Course
                                      )}`}
                                    >
                                      <div className="font-medium flex gap-2 items-center">
                                        {item.Course}
                                         <span className="text-sm">{getTypeIcon(item.Course)}</span>
                                      </div>
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
              {Object.keys(priorityGrouped).map((day) => (
                 priorityGrouped[day as Weekday].length > 0 && (
                  <div key={day}>
                    {priorityGrouped[day as Weekday].map((item, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-white">
                        <h4 className="font-medium mb-1">{item.name}</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Weekday:</span>
                            <span className="font-medium">{item.day}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Weekly Time:</span>
                            <span className="font-medium">{item.time}</span>
                          </div>
                          <Badge
                            variant={
                              item.intensity === "hard"
                                ? "destructive"
                                : item.intensity === "mid"
                                  ? "default"
                                  : "secondary"
                            }
                            className="mt-2"
                          >
                            {item.intensity}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                 )
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
// Chat history in chat room and adjust chat platform
//Dash board editing 
// Limit amount of chats and chat sessions for user since it is a demo but after limit is reached give option to join waitlist for launch 
// Add terms and conditions for user to agree on
//Animations
//File documentation of project