"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, ArrowLeft, Download, Clock, BookOpen, CheckCircle2, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import LoadingThreeDotsJumping from "@/components/animations/loading"
import { supabase } from "@/supabaseClient"

type Weekday = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"

interface Course {
  name: string
  day: Weekday
  time?: string
  category: "calculation" | "coding" | "theory"
  intensity: "hard" | "easy" | "mid" | "hard-to-grasp" | "bulky" | "both-hard-bulky"
  University: string
  Level: string
  Department: string
}

interface Extract {
  Day: string
  Course: string
  Start: string
  End: string
}

interface Table {
  schedule: Record<Weekday, Extract[]>
}

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
}

const slideInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
}

const slideInRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const successPulse = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
}

const timetableGrid = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
}

const dayColumn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

const courseCard = {
  initial: { opacity: 0, scale: 0.9, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
}

export default function TimetableResultPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [timeTable, setTimeTable] = useState<Table[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [priorityGrouped, setPriorityGrouped] = useState<Record<Weekday, Course[]>>({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });

  const days: Weekday[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  //Getting data
  useEffect(() => {
    const saved = localStorage.getItem("Table")
    if (saved) {
      const { tableId,sessionId } = JSON.parse(saved)
      setSessionId(sessionId);
      getTimeTable(tableId)
    }
  }, [])

  const getTimeTable = async (id: string) => {
    const { data, error } = await supabase.from("student_courses").select("Priority_Grouped, schedule").eq("id", id)

    if (error) {
      console.error("❌ Failed to fetch timetable:", error)
      return
    }

    if (data && data.length > 0) {
      const entry = data[0]

      setTimeTable([{ schedule: entry.schedule }])
      setPriorityGrouped(entry.Priority_Grouped as Record<Weekday, Course[]>)

      // Trigger celebration animation
      setTimeout(() => setShowCelebration(true), 500)
    } else {
      console.warn("⚠️ No timetable found for this ID.")
    }
  }

  const getIntensityColor = (courseName: string) => {
    let matchedIntensity: Course["intensity"] | undefined
    const cleanedCourse = courseName.replace(/\s*$$.*?$$\s*/g, "").trim()
    // Search through all days in priorityGrouped
    for (const day of Object.keys(priorityGrouped) as Weekday[]) {
      const course = priorityGrouped[day].find((c) => c.name === cleanedCourse)
      if (course) {
        matchedIntensity = course.intensity
        break // Stop searching once we find a match
      }
    }

    switch (matchedIntensity) {
      case "hard":
        return "bg-red-100 border-red-200 text-red-800"
      case "hard-to-grasp":
        return "bg-red-100 border-red-200 text-red-800"
      case "both-hard-bulky":
        return "bg-red-100 border-red-200 text-red-800"
      case "mid":
        return "bg-yellow-100 border-yellow-200 text-yellow-800"
      case "bulky":
        return "bg-yellow-100 border-yellow-200 text-yellow-800"
      case "easy":
        return "bg-green-100 border-green-200 text-green-800"
      default:
        return "bg-blue-100 border-blue-200 text-blue-800"
    }
  }

  const getTypeIcon = (courseName: string) => {
    let matchedIntensity: Course["category"] | undefined
    const cleanedCourse = courseName.replace(/\s*$$.*?$$\s*/g, "").trim()
    // Search through all days in priorityGrouped
    for (const day of Object.keys(priorityGrouped) as Weekday[]) {
      const course = priorityGrouped[day].find((c) => c.name === cleanedCourse)
      if (course) {
        matchedIntensity = course.category
        break // Stop searching once we find a match
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

  function isLoadingAnimation(){
    setIsLoading(true)
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {isLoading ? <LoadingThreeDotsJumping color="#b123e5ff"/> :(
        <div>

      <motion.header
        className="bg-white border-b"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/timetable-generator">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={isLoadingAnimation} variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Generator
                </Button>
              </motion.div>
            </Link>
          </div>
          <div className="flex space-x-2">
            <div className="flex items-center space-x-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <Calendar className="h-6 w-6 text-green-600" />
              </motion.div>
              <span className="text-xl font-bold text-gray-900">Generated Timetable</span>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-8">
        {/* Success Message */}
        <motion.div
          variants={successPulse}
          initial="initial"
          animate="animate"
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
          }}
        >
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <motion.div
                  animate={showCelebration ? { scale: [1, 1.2, 1], rotate: [0, 360] } : {}}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <CheckCircle2 className="h-6 w-6" />
                </motion.div>
                <span>Timetable Generated Successfully!</span>
              </CardTitle>
              <CardDescription className="text-green-700">
                Your personalized study schedule has been created based on your course intensity levels and AI
                recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <motion.div
                className="grid md:grid-cols-3 gap-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {[
                  { icon: BookOpen, text: "Courses optimized" },
                  { icon: Clock, text: "1-3 hours daily study time" },
                  { icon: MessageSquare, text: "AI recommendations applied" },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center space-x-2"
                    variants={fadeInUp}
                    whileHover={{ x: 5 }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3, delay: index * 0.5 }}
                    >
                      <item.icon className="h-4 w-4 text-green-600" />
                    </motion.div>
                    <span className="text-sm">{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Timetable Grid */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.3, duration: 0.6 }}>
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
                      <motion.div key={index} variants={timetableGrid} initial="initial" animate="animate">
                        {/* Grid with 7 columns for days */}
                        <div className="grid grid-cols-7 gap-4">
                          {days.map((day, dayIndex) => {
                            const dailyEntries = tableEntry.schedule[day as Weekday] || []
                            return (
                              <motion.div
                                key={day}
                                className="bg-gray-50 border rounded p-2 min-h-[100px]"
                                variants={dayColumn}
                                whileHover={{ scale: 1.02, y: -2 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                <motion.div
                                  className="text-center font-semibold text-sm mb-2 text-blue-800"
                                  animate={{ opacity: [0.7, 1, 0.7] }}
                                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3, delay: dayIndex * 0.2 }}
                                >
                                  {day}
                                </motion.div>
                                <div className="space-y-2">
                                  <AnimatePresence>
                                    {dailyEntries.length > 0 ? (
                                      dailyEntries.map((item, i) => (
                                        <motion.div
                                          key={i}
                                          className={`rounded border p-2 text-xs ${getIntensityColor(item.Course)}`}
                                          variants={courseCard}
                                          initial="initial"
                                          animate="animate"
                                          exit="exit"
                                          transition={{ delay: i * 0.1 }}
                                          whileHover={{ scale: 1.05, y: -2 }}
                                          whileTap={{ scale: 0.95 }}
                                        >
                                          <div className="font-medium flex gap-2 items-center">
                                            {item.Course}
                                            <motion.span
                                              className="text-sm"
                                              animate={{ rotate: [0, 10, -10, 0] }}
                                              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 4 }}
                                            >
                                              {getTypeIcon(item.Course)}
                                            </motion.span>
                                          </div>
                                          <div className="opacity-75">
                                            {item.Start} - {item.End}
                                          </div>
                                        </motion.div>
                                      ))
                                    ) : (
                                      <motion.div
                                        className="text-center text-gray-400 text-xs py-4 border-2 border-dashed rounded"
                                        variants={courseCard}
                                        initial="initial"
                                        animate="animate"
                                        whileHover={{ borderColor: "#9CA3AF" }}
                                      >
                                        No classes
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </motion.div>
                            )
                          })}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.p
                      className="text-center text-sm text-gray-500 py-4"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                    >
                      Loading schedule or no schedule available...
                    </motion.p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Course Summary */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.6, duration: 0.6 }}>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Course Summary</CardTitle>
              <CardDescription>Weekly time allocation for each course</CardDescription>
            </CardHeader>
            <CardContent>
              <motion.div
                className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {Object.keys(priorityGrouped).map((day) =>
                  priorityGrouped[day as Weekday].length > 0 ? (
                    <div key={day}>
                      {priorityGrouped[day as Weekday].map((item, index) => (
                        <motion.div
                          key={index}
                          className="p-4 border rounded-lg bg-white"
                          variants={scaleIn}
                          whileHover={{ scale: 1.03, y: -3 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
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
                            <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 400 }}>
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
                            </motion.div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : null,
                )}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex justify-between items-center mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <Link href={`/chat/${sessionId}`}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3 }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                </motion.div>
                Modify with AI
              </Button>
            </motion.div>
          </Link>
          <div className="space-x-4">
            <Link href="/dashboard">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost">Back to Dashboard</Button>
              </motion.div>
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button>
                <motion.div animate={{ y: [0, -2, 0] }} transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}>
                  <Download className="h-4 w-4 mr-2" />
                </motion.div>
                Save Timetable
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
      </div>
      )}
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
//Get list of courses for department