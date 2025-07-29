"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Calendar, ArrowLeft, ArrowRight, CheckCircle2, MessageSquare, PlusCircle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import LoadingThreeDotsJumping from "@/components/animations/loading"

const courseSchema = z.object({
  name: z.string().min(1, "Course name is required"),
  day: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]),
  time: z.string().optional(),
  category: z.enum(["calculation", "coding", "theory"]),
  intensity: z.enum(["hard", "easy", "mid", "hard-to-grasp", "bulky", "both-hard-bulky"]),
  University: z.string().optional(),
  Level: z.string().optional(),
  Department: z.string().optional(),
})

type Weekday = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday"
type Course = z.infer<typeof courseSchema>

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
}

const slideInRight = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
}

const bounceIn = {
  initial: { opacity: 0, scale: 0.3 },
  animate: {
    opacity: 1,
    scale: 1,
  },
  transition: {
    type: "spring",
    stiffness: 300,
    damping: 20,
  },
}

export default function TimetableGeneratorPage() {
  const { userId } = useAuth()
  const router = useRouter()
  let stepdata = ""
  const [currentStep, setCurrentStep] = useState(1)
  const [schedule, setSchedule] = useState<Course[]>([])
  const [storedID, setStored] = useState<string>("")
  const [open, setOpen] = useState(false)
  const [progressValue, setProgressValue] = useState(0)
  const [form, setForm] = useState<Course>({
    name: "",
    day: "Monday",
    time: "",
    category: "calculation",
    intensity: "mid",
    University: "",
    Level: "",
    Department:""
  })
  const [grouped, setGrouped] = useState<Record<Weekday, Course[]>>({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
  })

  const [priorityGrouped, setPriorityGrouped] = useState<Record<Weekday, Course[]>>({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
  })

  const steps = [
    {
      id: 1,
      title: "Input Courses",
      description: "Add courses with intensity and category",
      completed: currentStep > 1,
    },
    {
      id: 2,
      title: "Chat with AI",
      description: "Get personalized study time recommendations",
      completed: currentStep > 2,
    },
    { id: 3, title: "Generate Timetable", description: "Create your optimized schedule", completed: false },
  ]

  const [loading,setLoading] = useState<Boolean>(false)

  function isLoading(){
    setLoading(true)
  }

  // Animate progress bar when step changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgressValue((currentStep / 3) * 100)
    }, 200)
    return () => clearTimeout(timer)
  }, [currentStep])

  // Logic for Sorting and Grouping
  useEffect(() => {
    const priorityOrder = ["hard", "both-hard-bulky", "hard-to-grasp", "mid", "bulky", "easy"]
    const newGrouped: Record<Weekday, Course[]> = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
    }
    const unsortedGrouped: Record<Weekday, Course[]> = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
    }

    schedule.forEach((item) => {
      newGrouped[item.day].push(item)
      unsortedGrouped[item.day].push(item)
    })

    for (const day in newGrouped) {
      newGrouped[day as Weekday].sort((a, b) => {
        const priorityA = priorityOrder.indexOf(a.intensity)
        const priorityB = priorityOrder.indexOf(b.intensity)
        return priorityA - priorityB
      })
    }

    setGrouped(unsortedGrouped)
    setPriorityGrouped(newGrouped)
  }, [schedule])

  useEffect(() => {
    const saved = localStorage.getItem("session")
    const savedStep = localStorage.getItem("steps-data")
    if (saved) {
      const { chatId, sessionId } = JSON.parse(saved)
      setStored(sessionId)
    }
    if (savedStep) {
        const{step} = JSON.parse(savedStep);
        stepdata = step;
      }
  }, [])

  function handleCategoryChange(category: Course["category"]) {
    let defaultIntensity: Course["intensity"] = "mid"
    if (category === "theory") {
      defaultIntensity = "bulky"
    }
    setForm({ ...form, category, intensity: defaultIntensity })
  }

  function handleIntensityChange(value: Course["intensity"]) {
    setForm({ ...form, intensity: value })
  }

  function handleAdd() {
    setSchedule([...schedule, form])
    setForm({
      name: "",
      day: "Monday",
      time: "",
      category: "calculation",
      intensity: "mid",
    })
    const stepData = {
       step:1
      }
       localStorage.setItem("steps-data", JSON.stringify(stepData))
  }

  const resume = () => {
    if (storedID) {
      setOpen(true)
    } else {
      handleScheduleDay("New")
    }
  }

  const newChat = () => {
    const emptyValue = "New"
    setStored(emptyValue)
    setOpen(false)
    handleScheduleDay(emptyValue)
  }

  async function handleScheduleDay(response: string) {
    console.log(`Starting AI conversation for Student`)
      const stepData = {
       step:2
      }
       localStorage.setItem("steps-data", JSON.stringify(stepData))
    if (storedID === response) {
      const chatData = {
        user: userId,
        storedID,
      }
      localStorage.setItem("ai-chat-data", JSON.stringify(chatData))
      router.push(`/chat/${storedID}`)
    } else {
      const chatData = {
        priorityGrouped,
        grouped,
      }
      localStorage.setItem("ai-chat-data", JSON.stringify(chatData))
      router.push(`/chat/new`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {loading ? <LoadingThreeDotsJumping/> :(
        <div>
      <motion.header
        className="bg-white border-b"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/dashboard?step=${stepdata}`}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={isLoading} variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </motion.div>
            </Link>
            <div className="flex items-center space-x-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <Calendar className="h-6 w-6 text-blue-600" />
              </motion.div>
              <span className="text-xl font-bold text-gray-900">Timetable Generator</span>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence mode="wait">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <span></span>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <DialogTitle>Continue Previous Chat?</DialogTitle>
                <DialogDescription>
                  It looks like you have an ongoing conversation. What would you like to do?
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 text-center">
                <h2 className="text-lg font-semibold mb-2">You have already started a chat.</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Do you want to continue it or start a new one?
                </p>
              </div>
              <DialogFooter className="flex items-center justify-between gap-2 py-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button type="button" variant="outline" onClick={newChat}>
                    Start New
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      handleScheduleDay(storedID)
                    }}
                  >
                    Continue Chat
                  </Button>
                </motion.div>
              </DialogFooter>
            </motion.div>
          </DialogContent>
        </Dialog>
      </AnimatePresence>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create Your Personalized Timetable</CardTitle>
              <CardDescription>Follow these 3 steps to generate your AI-optimized study schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <motion.span
                      key={currentStep}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      Step {currentStep} of 3
                    </motion.span>
                  </div>
                  <div className="relative">
                    <Progress value={progressValue} className="h-3" />
                    <motion.div
                      className="absolute top-0 left-0 h-3 bg-blue-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressValue}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Steps */}
                <motion.div
                  className="grid md:grid-cols-3 gap-6"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  {steps.map((step, index) => (
                    <motion.div
                      key={step.id}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                        step.id === currentStep
                          ? "border-blue-500 bg-blue-50 shadow-lg"
                          : step.completed
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 bg-gray-50"
                      }`}
                      variants={scaleIn}
                      whileHover={{ scale: 1.02, y: -2 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <motion.div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            step.completed
                              ? "bg-green-500 text-white"
                              : step.id === currentStep
                                ? "bg-blue-500 text-white"
                                : "bg-gray-300 text-gray-600"
                          }`}
                          animate={step.id === currentStep ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                        >
                          {step.completed ? (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.3 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 20,
                              }}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </motion.div>
                          ) : (
                            step.id
                          )}
                        </motion.div>
                        <h3 className="font-medium">{step.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Current Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              className="space-y-6"
              variants={slideInRight}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 2, ease: "easeInOut" }}>
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </motion.div>
                      <span>Step 1: Add Courses</span>
                    </div>
                    <div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button onClick={handleAdd}>
                          <PlusCircle className="mr-2 h-4 w-4" /> Add Course
                        </Button>
                      </motion.div>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Add courses with their intensity levels and categories. Review them below.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between gap-4">
                    <div className="space-y-4 w-full">
                      <motion.div variants={scaleIn} className="flex">
                          <Input
                            placeholder="University e.g Bingham University"
                            value={form.University}
                            onChange={(e) => setForm({ ...form, University: e.target.value })}
                            className="w-full"
                          />
                          <Select value={form.University} onValueChange={(value) => setForm({ ...form, University: value })} >
                            <SelectTrigger>
                              <SelectValue placeholder="" />
                            </SelectTrigger>
                            <SelectContent className="w-full">
                              <SelectItem value="Bingham University">Bingham University</SelectItem>
                              <SelectItem value="Veritas University">Veritas University</SelectItem>
                            </SelectContent>
                          </Select>
                        </motion.div>
                      <motion.div
                        className="grid grid-cols-2 gap-4 w-full"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                      >
                        <motion.div variants={scaleIn}>
                          <Select value={form.Department}  onValueChange={(value) => setForm({ ...form, Department: value })}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Department" />
                            </SelectTrigger>
                            <SelectContent className="w-full">
                              <SelectItem value="Computer Science">Computer Science</SelectItem>
                              <SelectItem value="Mass Com">Mass Com</SelectItem>
                              <SelectItem value="Cyber Security">Cyber Security</SelectItem>
                              <SelectItem value="Public Health">Public Health</SelectItem>
                              <SelectItem value="Architecture">Architecture</SelectItem>
                            </SelectContent>
                          </Select>
                        </motion.div>
                        <motion.div variants={scaleIn}>
                          <Select value={form.Level}  onValueChange={(value) => setForm({ ...form, Level: value })}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Level" />
                            </SelectTrigger>
                            <SelectContent className="w-full">
                              <SelectItem value="100">100 Level</SelectItem>
                              <SelectItem value="200">200 Level</SelectItem>
                              <SelectItem value="300">300 Level</SelectItem>
                              <SelectItem value="400">400 Level</SelectItem>
                              <SelectItem value="500">500 Level</SelectItem>
                            </SelectContent>
                          </Select>
                        </motion.div>
                        <motion.div variants={scaleIn}>
                          <Input
                            placeholder="Course Name e.g MTH"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full"
                          />
                        </motion.div>
                        <motion.div variants={scaleIn}>
                          <Input
                            placeholder="e.g 10am to 12pm or 10am - 12pm"
                            value={form.time}
                            onChange={(e) => setForm({ ...form, time: e.target.value })}
                            className="w-full"
                          />
                        </motion.div>
                      </motion.div>

                      <motion.div
                        className="grid grid-cols-3 gap-4 w-full"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                      >
                        <motion.select
                          value={form.day}
                          onChange={(e) => setForm({ ...form, day: e.target.value as Weekday })}
                          className="w-full p-2 border rounded-md bg-white"
                          variants={scaleIn}
                          whileFocus={{ scale: 1.02 }}
                        >
                          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                            <option key={day} value={day}>
                              {day}
                            </option>
                          ))}
                        </motion.select>
                        <motion.select
                          value={form.category}
                          onChange={(e) => handleCategoryChange(e.target.value as Course["category"])}
                          className="w-full p-2 border rounded-md bg-white"
                          variants={scaleIn}
                          whileFocus={{ scale: 1.02 }}
                        >
                          {["calculation", "coding", "theory"].map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </motion.select>
                        <motion.select
                          value={form.intensity}
                          onChange={(e) => handleIntensityChange(e.target.value as Course["intensity"])}
                          className="w-full p-2 border rounded-md bg-white"
                          variants={scaleIn}
                          whileFocus={{ scale: 1.02 }}
                        >
                          {form.category === "calculation" || form.category === "coding"
                            ? ["hard", "mid", "easy"].map((condition) => (
                                <option key={condition} value={condition}>
                                  {condition}
                                </option>
                              ))
                            : ["hard-to-grasp", "bulky", "easy", "both-hard-bulky"].map((condition) => (
                                <option key={condition} value={condition}>
                                  {condition}
                                </option>
                              ))}
                        </motion.select>
                      </motion.div>

                      <motion.div
                        className="flex justify-between flex-wrap"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                      >
                        {(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as Weekday[]).map((day, index) => (
                          <motion.div key={day} className="mb-4" variants={scaleIn} whileHover={{ y: -5 }}>
                            <h2 className="font-bold text-lg">{day}</h2>
                            {grouped[day].length > 0 ? (
                              <motion.ul
                                className="list-disc ml-6"
                                variants={staggerContainer}
                                initial="initial"
                                animate="animate"
                              >
                                {grouped[day].map((item, itemIndex) => (
                                  <motion.li
                                    key={itemIndex}
                                    variants={fadeInUp}
                                    whileHover={{ x: 5, color: "#2563eb" }}
                                  >
                                    {item.name}
                                  </motion.li>
                                ))}
                              </motion.ul>
                            ) : (
                              <p className="text-sm text-gray-500 ml-2">No classes</p>
                            )}
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              className="space-y-6"
              variants={slideInRight}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                    >
                      <MessageSquare className="h-5 w-5 text-blue-500" />
                    </motion.div>
                    <span>Step 2: Chat with AI for Time Recommendations</span>
                  </CardTitle>
                  <CardDescription>
                    Discuss your study preferences and get personalized time recommendations from our AI assistant.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <motion.div
                    className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                    >
                      <MessageSquare className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-lg font-medium mb-2">Ready to Chat with AI?</h3>
                    <p className="text-gray-600 mb-6">
                      Our AI will analyze your courses and help determine the best study times based on:
                    </p>
                    <motion.div
                      className="grid md:grid-cols-2 gap-4 text-left mb-6"
                      variants={staggerContainer}
                      initial="initial"
                      animate="animate"
                    >
                      <div className="space-y-2">
                        {["Course intensity levels", "Your daily schedule preferences"].map((item, index) => (
                          <motion.div
                            key={index}
                            className="flex items-center space-x-2"
                            variants={fadeInUp}
                            whileHover={{ x: 5 }}
                          >
                            <motion.div
                              className="w-2 h-2 bg-blue-600 rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2, delay: index * 0.2 }}
                            />
                            <span className="text-sm">{item}</span>
                          </motion.div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        {["Peak focus hours", "Break and review sessions"].map((item, index) => (
                          <motion.div
                            key={index}
                            className="flex items-center space-x-2"
                            variants={fadeInUp}
                            whileHover={{ x: 5 }}
                          >
                            <motion.div
                              className="w-2 h-2 bg-blue-600 rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2, delay: (index + 2) * 0.2 }}
                            />
                            <span className="text-sm">{item}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="lg" onClick={resume}>
                        Start AI Chat
                        <MessageSquare className="ml-2 h-4 w-4" />
                      </Button>
                    </motion.div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              className="space-y-6"
              variants={slideInRight}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    >
                      <Calendar className="h-5 w-5 text-green-500" />
                    </motion.div>
                    <span>Step 3: Generate Your Timetable</span>
                  </CardTitle>
                  <CardDescription>
                    Based on your courses and AI recommendations, generate your personalized study timetable.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <motion.div
                    className="bg-green-50 border border-green-200 rounded-lg p-6 text-center"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                    >
                      <Calendar className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-lg font-medium mb-2">Ready to Generate Your Timetable!</h3>
                    <p className="text-gray-600 mb-6">
                      All information has been collected. Your timetable will include:
                    </p>
                    <motion.div
                      className="grid md:grid-cols-2 gap-4 text-left mb-6"
                      variants={staggerContainer}
                      initial="initial"
                      animate="animate"
                    >
                      <div className="space-y-2">
                        {["Optimized study times", "Regular break intervals"].map((item, index) => (
                          <motion.div
                            key={index}
                            className="flex items-center space-x-2"
                            variants={fadeInUp}
                            whileHover={{ x: 5 }}
                          >
                            <motion.div
                              className="w-2 h-2 bg-green-600 rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2, delay: index * 0.2 }}
                            />
                            <span className="text-sm">{item}</span>
                          </motion.div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        {["Review and practice sessions", "Weekly schedule format"].map((item, index) => (
                          <motion.div
                            key={index}
                            className="flex items-center space-x-2"
                            variants={fadeInUp}
                            whileHover={{ x: 5 }}
                          >
                            <motion.div
                              className="w-2 h-2 bg-green-600 rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2, delay: (index + 2) * 0.2 }}
                            />
                            <span className="text-sm">{item}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                    <Link href="/timetable-generator/result">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button size="lg" className="bg-green-600 hover:bg-green-700">
                          Generate Timetable
                          <Calendar className="ml-2 h-4 w-4" />
                        </Button>
                      </motion.div>
                    </Link>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <motion.div
          className="flex justify-between items-center mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous Step
            </Button>
          </motion.div>
          <div className="text-sm text-gray-500">Step {currentStep} of 3</div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={() => setCurrentStep(Math.min(3, currentStep + 1))} disabled={currentStep === 3}>
              Next Step
              <motion.div
                className="ml-2"
                animate={{ x: [0, 3, 0] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
              >
                <ArrowRight className="h-4 w-4" />
              </motion.div>
            </Button>
          </motion.div>
        </motion.div>
      </div>
      </div>
    )}
    </div>
  )
}
