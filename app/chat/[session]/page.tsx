"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Send, Bot, User, Calendar, Clock, BookOpen } from "lucide-react"
import Link from "next/link"
import { type FormEvent, useEffect, useRef, useState } from "react"
import { supabase } from "@/supabaseClient"
import Markdown from "react-markdown"
import { useAuth } from "@clerk/nextjs"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import LoadingThreeDotsJumping from "@/components/animations/loading"

type Weekday = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"

type messages = {
  content: string
  role: string
  type: string
}

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

interface History {
  title: string
}

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

const slideInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
}

const slideInRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 30 },
}

export default function TimetableChatPage() {
  const { userId } = useAuth()
  const initialized = useRef(false)
  const params = useParams<{ session: string }>()
  const router = useRouter()
  const[loader,setLoader] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const[loading,setLoading] = useState<boolean>(false)
  const [input, setInput] = useState<string>("")
  const [messageList, setMessageList] = useState<messages[]>([])
  const [sessionId, setSessionId] = useState<string>("")
  const [tableId, setTableId] = useState<string>("")
  const [showTyping, setShowTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [grouped, setGrouped] = useState<Record<Weekday, Course[]>>({
    Sunday: [],
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
  })

  const [priorityGrouped, setPriorityGrouped] = useState<Record<Weekday, Course[]>>({
    Sunday: [],
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
  })

  const [chatHistory, setChatHistory] = useState<History[]>([])

  function setLoadingAnimation(){
    setLoader(true)
  }
  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messageList, showTyping])

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true

      const init = async () => {
        const saved = localStorage.getItem("ai-chat-data")
        retrieveChatHistory(userId)
        //if params(session.id) exist then retrieve old messsages
        if (params.session.includes("new")) {
          if (saved) {
            const { priorityGrouped, grouped } = JSON.parse(saved)
            setPriorityGrouped(priorityGrouped)
            setGrouped(grouped)
          }
        } else {
          setLoading(true);
          setSessionId(params.session)
          //Loading State false
          const { data: history } = await supabase
            .from("chat_sessions")
            .select("title")
            .eq("id", params.session)
            .eq("user_id",userId)
            .select()
            .single()

          setTableId(history?.table)

          const { data: oldMessages } = await supabase
            .from("chat_messages")
            .select("role, content")
            .eq("chat_id", params.session)
            .order("created_at", { ascending: true })


          if (oldMessages) {
            console.log("Message found")
            setMessageList(
              (oldMessages || []).map((msg) => ({
                ...msg,
                type: "text",
              })),
            )
          }
          setLoading(false);
        }

        localStorage.removeItem("ai-chat-data")
      }

      init()
    }
  }, [])

  useEffect(() => {
    if (messageList.length > 0) {
      const chatData = {
        sessionId,
        userId,
      }
      localStorage.setItem("session", JSON.stringify(chatData))
    } else {
      localStorage.removeItem("session")
    }
  }, [messageList])

  const retrieveChatHistory = async (id: string | null | undefined) => {
    const { data: history, error } = await supabase.from("chat_sessions").select("title").eq("user_id", id)

    if (history) {
      setChatHistory(history)
    }
  }

  const handleSubmit = async (e?: FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    // if (!chatId) return;
    const text = overrideText ?? input;
    if(sessionId){
      console.log("Old Session")
      const userMsg = { content: text, role: "user", type: "text" }
      setMessageList((prev) => [...prev, userMsg])
      setInput("")
      setIsLoading(true)
      setShowTyping(true) // Show typing indicator
      await supabase.from("chat_messages").insert({
        chat_id: sessionId,
        role: "user",
        content: text,
      })

      // 2. Send to backend AI API
      const result = await fetch("../api/ai-timtable-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInput: {
            priorityGrouped,
            message: [...messageList, userMsg],
          },
        }),
      })
      const { runId, error } = await result.json()
      if (!runId || error) {
        console.error("Error starting AI:", error)
        setShowTyping(false)
        setIsLoading(false)
        return
      }

      // 3. Save AI response to Supabase
      pollRunStatus(runId,sessionId)
    }else{
      console.log("New Session")
      const { data: session } = await supabase
        .from("student_courses")
        .insert({
          chat_id: userId,
          Courses: grouped,
          Priority_Grouped: priorityGrouped,
        })
        .select()
        .single()
  
      if (session) {
        const { data: sess } = await supabase
          .from("chat_sessions")
          .insert({ user_id: userId, title: `Chat for `, table: session?.id })
          .select()
          .single()
  
        setSessionId(sess?.id)
        setTableId(session?.id)
        //1
        const userMsg = { content: text, role: "user", type: "text" }
        setMessageList((prev) => [...prev, userMsg])
        setInput("")
        setIsLoading(true)
        setShowTyping(true) // Show typing indicator
  
        // 1. Save user message to Supabase
        await supabase.from("chat_messages").insert({
          chat_id: sess?.id,
          role: "user",
          content: text,
        })
  
        // 2. Send to backend AI API
        const result = await fetch("../api/ai-timtable-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userInput: {
              priorityGrouped,
              message: [...messageList, userMsg],
            },
          }),
        })
  
        // const json = await result.json();
        const { runId, error } = await result.json()
        if (!runId || error) {
          console.error("Error starting AI:", error)
          setShowTyping(false)
          setIsLoading(false)
          return
        }
  
        // 3. Save AI response to Supabase
        pollRunStatus(runId,sess?.id)
      }
    }
  }

  const pollRunStatus = async (runId: string,id:string) => {
    let attempts = 0
    const maxAttempts = 220
    while (attempts < maxAttempts) {
      const res = await fetch(`../api/check-run-status?runId=${runId}`)
      const data = await res.json()
      if (data.status === "Completed") {
        setShowTyping(false) // Hide typing indicator

        // use it in UI
        const aiMessage = {
          content: data.output.output[0].content, // extract only content
          role: "assistant",
          type: "text",
        }

        await supabase.from("chat_messages").insert({
          chat_id: id,
          role: "assistant",
          content: aiMessage.content,
        })

        // 4. Update UI
        setMessageList((prev) => [...prev, aiMessage])
        setIsLoading(false)
        return
      }
      await new Promise((resolve) => setTimeout(resolve, 500))
      attempts++
    }
    console.warn("🕒 AI response polling timed out.")
    setShowTyping(false)
    setIsLoading(false)
  }

  const extracText = () => {
    if (messageList.length === 0) return
    const last = messageList[messageList.length - 1]

    if (last.role !== "user") extractTime(last.content)
  }

  //EXTRACTION PHASSEEEE!!!!
  const cleanText = (text: string) =>
    text
      .replace(/\r\n|\r/g, "\n") // Normalize all line endings
      .replace(/\n{2,}/g, "\n\n") // Collapse multiple blank lines into one paragraph break
      .replace(/[ \t]{2,}/g, " ") // Collapse extra spaces/tabs
      .trim()

  const extractTime = async (rawText: string) => {
    const text = cleanText(rawText)
    //Regex to basically extract Day, Course, Start Time for Studying and End Time from AI text
    const matches = [
      ...text.matchAll(
        /\*\*Day:\*\*\s*(.+?)\s*\n+\*\*Start Time:\*\*\s*(.+?)\s*\n+\*\*End Time:\*\*\s*(.+?)\s*\n+\*\*Courses:\*\*\s*(.+?)(?=\n{2,}|$)/gi,
      ),
    ]

    if (matches.length > 0) {
      setLoader(true)
      const updates: Record<Weekday, { Day: string; Course: string; Start: string; End: string }[]> = {
        Sunday: [],
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
      }

      matches.forEach((match) => {
        const day = match[1].trim() as Weekday
        const start = match[2].trim()
        const end = match[3].trim()
        const course = match[4].trim()
        const cleanedCourse = course.replace(/\s*$$.*?$$\s*/g, "").trim()

        updates[day].push({ Day: day, Course: cleanedCourse, Start: start, End: end })
      })

      await supabase.from("student_courses").update({ schedule: updates }).eq("id", tableId)

      const stepData = {
       step:3
      }
       localStorage.setItem("steps-data", JSON.stringify(stepData))
      const chatData = {
        tableId,
        sessionId
      }
      localStorage.setItem("Table", JSON.stringify(chatData))
      router.push("/timetable-generator/result")

    } else {
      toast("❌ No time block found.")
      console.log("❌ No time block found.")
    }
  }

  function sendPrompt(text:string){
    console.log(text)
    setInput(text);
    handleSubmit(undefined, text);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {loader ? <LoadingThreeDotsJumping/>:(
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
                <Button onClick={setLoadingAnimation} variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Generator
                </Button>
              </motion.div>
            </Link>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <Badge variant="secondary">Step 2 of 3</Badge>
          </motion.div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-6 h-[calc(100vh-80px)]">
        <div className="grid lg:grid-cols-4 gap-6 h-full">
          {/* Course Summary Sidebar */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="h-100vh">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3 }}
                  >
                    <BookOpen className="h-5 w-5" />
                  </motion.div>
                  <span>Your Courses</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {chatHistory.map((chat, index) => (
                  <motion.div
                    key={index}
                    className="p-3 border rounded-lg bg-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <h4 className="font-medium text-sm">{chat.title}</h4>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Chat Interface */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="h-full flex flex-col relative">
              <CardHeader className="border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">AI Study Planner</CardTitle>
                    <CardDescription>Get personalized study time recommendations</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <motion.div
                      className="w-2 h-2 bg-green-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                    />
                    <span className="text-sm text-gray-600">AI Online</span>
                  </div>
                </div>
              </CardHeader>
              {/* Messages */}
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-[calc(100vh-350px)] p-4">
                  {loading ? 
                  <div className="mx-30">
                    <LoadingThreeDotsJumping/>
                  </div>
                  :(
                    <div>
                      {messageList.length <= 0 ? 
                        <div className="flex flex-col items-center text-center gap-10">
                          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
                            📚 What do you need help with today?
                          </h2>
                          <p className="text-muted-foreground max-w-md">
                            Choose the type of study plan you want. I’ll tailor your schedule with biblical encouragement and smart planning.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl">
                            <Button
                              className="py-6 text-md shadow-md"
                              onClick={() => sendPrompt("Generate Personalized Study TimeTable")}
                            >
                              🗓️ Generate Class Study Timetable
                            </Button>
                            <Button
                              variant="outline"
                              className="py-6 text-md shadow-md border-dashed"
                              onClick={() => sendPrompt("Generate Personalized Exam Study TimeTable")}
                            >
                              📖 Generate Exam Study Timetable
                            </Button>
                          </div>
                        </div>

                      :(
                      <div className="space-y-4">
                        <AnimatePresence>
                          {messageList.map((message, index) => (
                            <motion.div
                              key={index}
                              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                              variants={message.role === "user" ? slideInRight : slideInLeft}
                              initial="initial"
                              animate="animate"
                              exit="exit"
                              transition={{ duration: 0.4, delay: index * 0.1 }}
                            >
                              <div
                                className={`flex space-x-3 max-w-[85%] ${
                                  message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                                }`}
                              >
                                <motion.div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                                  }`}
                                  whileHover={{ scale: 1.1 }}
                                  animate={
                                    message.role === "assistant" ? { rotate: [0, 10, -10, 0] } : { scale: [1, 1.05, 1] }
                                  }
                                  transition={{
                                    rotate: { repeat: Number.POSITIVE_INFINITY, duration: 4 },
                                    scale: { repeat: Number.POSITIVE_INFINITY, duration: 2 },
                                  }}
                                >
                                  {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                </motion.div>
                                <motion.div
                                  className={`rounded-lg p-3 ${
                                    message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                                  }`}
                                  whileHover={{ scale: 1.02 }}
                                  transition={{ type: "spring", stiffness: 300 }}
                                >
                                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                    <Markdown>{message.content}</Markdown>
                                  </div>
                                  <div
                                    className={`text-xs mt-2 ${
                                      message.role === "user" ? "text-blue-100" : "text-gray-500"
                                    }`}
                                  >
                                    {/* {msg.time} */}
                                  </div>
                                </motion.div>
                              </div>
                            </motion.div>
                          ))}

                          {/* Typing Indicator */}
                          {showTyping && (
                            <motion.div
                              className="flex justify-start"
                              variants={slideInLeft}
                              initial="initial"
                              animate="animate"
                              exit="exit"
                            >
                              <div className="flex space-x-3 max-w-[85%]">
                                <motion.div
                                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-200 text-gray-600"
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{
                                    duration: 1,
                                    repeat: Number.POSITIVE_INFINITY,
                                    ease: "easeInOut",
                                  }}
                                >
                                  <Bot className="h-4 w-4" />
                                </motion.div>
                                <div className="rounded-lg p-3 bg-gray-100 text-gray-900">
                                  <div className="flex space-x-1">
                                    <motion.div
                                      className="w-2 h-2 bg-gray-400 rounded-full"
                                      animate={{ y: [0, -5, 0] }}
                                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.6, delay: 0 }}
                                    />
                                    <motion.div
                                      className="w-2 h-2 bg-gray-400 rounded-full"
                                      animate={{ y: [0, -5, 0] }}
                                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.6, delay: 0.2 }}
                                    />
                                    <motion.div
                                      className="w-2 h-2 bg-gray-400 rounded-full"
                                      animate={{ y: [0, -5, 0] }}
                                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.6, delay: 0.4 }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                      </div>
                      )}

                    </div>
                  )}
                </ScrollArea>
              </CardContent>


              {/* Message Input */}
              {messageList.length > 0 &&(
                <div>
              <motion.form
                onSubmit={handleSubmit}
                className="bg-white border-t p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <div className="flex space-x-2">
                  <motion.div className="flex-1" whileFocus={{ scale: 1.01 }}>
                    <Input
                      placeholder="Ask about your study schedule..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="flex-1"
                      disabled={isLoading}
                    />

                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button disabled={isLoading || input.trim() === ""}>
                      <motion.div
                        animate={isLoading ? { rotate: 360 } : {}}
                        transition={{ duration: 1, repeat: isLoading ? Number.POSITIVE_INFINITY : 0 }}
                      >
                        <Send className="h-4 w-4" />
                      </motion.div>
                    </Button>
                  </motion.div>
                </div>
              </motion.form>
               <motion.div
                      className="px-4"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7, duration: 0.4 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button className="bg-green-600 hover:bg-green-700" onClick={extracText}>
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                        </motion.div>
                        Generate Timetable
                      </Button>
                    </motion.div>

                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
      </div>
      )}
    </div>
  )
}


//Generate id to link chat + courses + timetable
//Make way that if something is in input and want to go back you will be prompted with an alert 
//Add table to chat flow in chat_message db
//Soln: Send session id through local storage if going back 
//Make AI CHAT Component not link so use steps state or something
//Add clickable only when time is extracted
//from input felds --> [session.id] dynamic route --> chat 
//if prarams exist 
//Look and logic so that duration for each study can be allocated
//Remove AI or use Hugging Face --> Sort using my logic arrange drag and drop(maybe)
//Set that session and student courses is created after message from user is inputted to avoid many session and courses creation
//Add waitlist after generating timetable

