"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Send, Bot, User, Calendar, Clock, BookOpen } from "lucide-react"
import Link from "next/link"
import { FormEvent, useEffect, useState } from "react"
import { supabase } from "@/supabaseClient"
import Markdown from "react-markdown"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

type Weekday = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
type messages = {
    content: string,
    role: string,
    type: string
}
interface Course {
    name: string;
    day: Weekday;
    time?: string
    category: 'calculation' | 'coding' | 'theory';
    intensity: 'hard' | 'easy' | 'mid' | 'hard-to-grasp' | 'bulky' | 'both-hard-bulky';
    startTime?: string;
    endTime?: string;
}

export default function TimetableChatPage() {
  const { userId } =useAuth()  
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const [messageList, setMessageList] = useState<messages[]>([]);
  const [sessionId,setSessionId] = useState<string>("");
  const [chatId, setChatId] = useState<string>("");
  const [tableId,setTableId] = useState<string>("");
  const [priorityGrouped, setPriorityGrouped] = useState<Record<Weekday, Course[]>>({
    Sunday:[],Monday: [],Tuesday: [],Wednesday: [],Thursday: [],Friday: [],Saturday:[] });
  
  useEffect(() => {
    const init = async () => {
        const saved = localStorage.getItem('ai-chat-data');
        if (saved) {
            const { priorityGrouped, chatId,storedID ,user,id} = JSON.parse(saved);
            if(storedID && user === userId ){
              setSessionId(storedID)
              setChatId(user)
              const { data: oldMessages } = await supabase
                .from("chat_messages")
                .select("role, content")
                .eq("chat_id", storedID)
                .order("created_at", { ascending: true });
                console.log("Message found");
              setMessageList(
                (oldMessages || []).map((msg) => ({
                    ...msg,
                    type: "text",
                }))
                );
                console.log(messageList);
            }else {
              setPriorityGrouped(priorityGrouped);
              setChatId(chatId);
              setTableId(id);
              if (chatId) {
                  createSession(chatId); 
              }
              console.log("new")
            }
            console.log("Saved",saved)  
             localStorage.removeItem('ai-chat-data');
    }
    };

    init();
  }, []);

useEffect(() => {
  if(messageList.length > 0){
     const chatData = {
      sessionId,
      chatId
     }
     console.log("User pressed the back button!", chatData);
    localStorage.setItem('session', JSON.stringify(chatData));
  }else{
     localStorage.removeItem('session');
  }
}, [messageList])

   const createSession= async (id:string) => {
      const { data: session, error } = await supabase
        .from("chat_sessions")
        .insert({user_id:id, title: `Chat for ` })
        .select()
        .single();
      if(session){
        setSessionId(session.id);
      }
    console.log("Session Created");
  }

    const handleSubmit = async (e: FormEvent) => {
    console.log("Clicked")
      e.preventDefault();
      if (!chatId) return;
  
      const userMsg = { content: input, role: "user", type: "text" };
      setMessageList((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);
  
      // 1. Save user message to Supabase
      await supabase.from("chat_messages").insert({
        chat_id: sessionId,
        role: "user",
        content: input,
      });
  
      // 2. Send to backend AI API
      const result = await fetch("api/ai-timtable-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInput: {
            priorityGrouped,
            message: [...messageList, userMsg],
          },
        }),
      });
  
    // const json = await result.json();
    const { runId, error } = await result.json();
    if (!runId || error) {
        console.error("Error starting AI:", error);
        return;
    }
      // 3. Save AI response to Supabase
        pollRunStatus(runId);
    };

const pollRunStatus = async (runId: string) => {
  let attempts = 0;
  const maxAttempts = 220;

  while (attempts < maxAttempts) {
    const res = await fetch(`/api/check-run-status?runId=${runId}`);
    const data = await res.json();

    if (data.status === "Completed") {
      console.log("✅ AI Response:", data.output.output[0]);
       // use it in UI
      const aiMessage = {
        content: data.output.output[0].content,   // extract only content
        role: "assistant",
        type: "text",
      };
       await supabase.from("chat_messages").insert({
          chat_id: sessionId,
          role: "assistant",
          content: aiMessage.content,
        });
    
        // 4. Update UI
        setMessageList((prev) => [...prev, aiMessage]);
        setIsLoading(false);
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    attempts++;
  }

  console.warn("🕒 AI response polling timed out.");
};

const extracText = () => {
   if (messageList.length === 0) return;
   const last = messageList[messageList.length - 1];
    if (last.role !== "user") extractTime(last.content);
}

//EXTRACTION PHASSEEEE!!!!
  const cleanText = (text: string) =>
    text
      .replace(/\r\n|\r/g, "\n")           // Normalize all line endings
      .replace(/\n{2,}/g, "\n\n")          // Collapse multiple blank lines into one paragraph break
      .replace(/[ \t]{2,}/g, " ")          // Collapse extra spaces/tabs
      .trim();

  const extractTime = async (rawText: string) => {
    const text = cleanText(rawText);
    //Regex to basically extract Day, Course, Start Time for Studying and End Time from AI text
    const matches = [...text.matchAll(
      /\*\*Day:\*\*\s*(.*?)\s*\n+\s*\*\*Start Time:\*\*\s*(.*?)\s*\n+\s*\*\*End Time:\*\*\s*(.*?)\s*\n+\s*\*\*Courses:\*\*\s*(.*?)(?=\n{2,}|\Z)/gi
   )];

    if (matches.length > 0) {
      const updates: Record<Weekday, { Day:string; Course: string; Start: string; End: string }[]> = {
        Sunday: [], Monday: [], Tuesday: [], Wednesday: [],
        Thursday: [], Friday: [], Saturday: [],
      };
      matches.forEach(match => {
        const day = match[1].trim() as Weekday;
        const start = match[2].trim();
        const end = match[3].trim();
        const course = match[4].trim();

        const cleanedCourse = course.replace(/\s*\(.*?\)\s*/g, '').trim();

        updates[day].push({ Day:day, Course: cleanedCourse, Start: start, End: end });
      });

      await supabase
        .from("student_courses")
        .update({ schedule: updates })
        .eq("id", tableId)
        console.log("✅ Stored all time blocks:", updates);
        const chatData = {
            tableId
          }
          localStorage.setItem('Table', JSON.stringify(chatData));
          router.push('/timetable-generator/result');

        
    } else {
      console.log("❌ No time block found.");
    }

  };


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
              <Bot className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">AI Study Planner</span>
            </div>
          </div>
          <Badge variant="secondary">Step 2 of 3</Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 h-[calc(100vh-80px)]">
        <div className="grid lg:grid-cols-4 gap-6 h-full">
          {/* Course Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-100vh">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Your Courses</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Advanced Mathematics", code: "MTH 301", intensity: "Hard", category: "Calculation" },
                  { name: "Computer Programming", code: "CSC 201", intensity: "Medium", category: "Theory" },
                  { name: "Physics Laboratory", code: "PHY 202", intensity: "Easy", category: "Practical" },
                  { name: "Statistics", code: "STA 301", intensity: "Medium", category: "Calculation" },
                ].map((course, index) => (
                  <div key={index} className="p-3 border rounded-lg bg-white">
                    <h4 className="font-medium text-sm">{course.name}</h4>
                    <p className="text-xs text-gray-600 mb-2">{course.code}</p>
                    <div className="flex space-x-1">
                      <Badge
                       
                        variant={
                          course.intensity === "Hard"
                            ? "destructive"
                            : course.intensity === "Medium"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {course.intensity}
                      </Badge>
                      <Badge  variant="outline">
                        {course.category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-full flex flex-col relative">
              <CardHeader className="border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">AI Study Planner</CardTitle>
                    <CardDescription>Get personalized study time recommendations</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">AI Online</span>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-[calc(100vh-350px)] p-4">
                  <div className="space-y-4">
                    {messageList.map((message, index) => (
                      <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`flex space-x-3 max-w-[85%] ${message.role  === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              message.role  === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {message.role  === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                          </div>
                          <div
                            className={`rounded-lg p-3 ${
                              message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            <div className="whitespace-pre-wrap text-sm leading-relaxed"> <Markdown>{message.content}</Markdown></div>
                            <div
                              className={`text-xs mt-2 ${message.role === "user" ? "text-blue-100" : "text-gray-500"}`}
                            >
                              {/* {msg.time} */}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Message Input */}
              <form onSubmit={handleSubmit} className="bg-white border-t p-4 absolute inset-x-0 bottom-15">
                <div className="flex space-x-2 mb-3">
                  <Input
                    placeholder="Ask about your study schedule..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button disabled={isLoading || input.trim() === ""}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Clock className="h-3 w-3 mr-1" />
                      Adjust Times
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calendar className="h-3 w-3 mr-1" />
                      Weekend Schedule
                    </Button>
                  </div>
                  {/* <Link href="/timetable-generator/result"> */}
                  {/* </Link> */}
                </div>
              </form>
               <Button
                  className="bg-green-600 hover:bg-green-700" onClick={extracText}
                >
                  Generate Timetable
                </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

//Generate id to link chat + courses + timetable
// Make way that if something is in input and want to go back you will be prompted with an alert 
//Add table to chat flow in chat_message db
//Soln: Send session id through local storage if going back 
//Make AI CHAT Component not link so use steps state or something
//Add clickable only when time is extracted