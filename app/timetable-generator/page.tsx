"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogFooter,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Calendar, ArrowLeft, ArrowRight, CheckCircle2, MessageSquare, PlusCircle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { z } from 'zod';
import { Input } from "@/components/ui/input"
import { supabase } from "@/supabaseClient"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from 'next/navigation';

const courseSchema = z.object({
  name: z.string().min(1, "Course name is required"),
  day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
  time: z.string().optional(),
  category: z.enum(['calculation', 'coding', 'theory']),
  intensity: z.enum([
    'hard',
    'easy',
    'mid',
    'hard-to-grasp',
    'bulky',
    'both-hard-bulky',
  ]),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});

type Weekday = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

type Course = z.infer<typeof courseSchema>;


export default function TimetableGeneratorPage() {
  const { userId } =useAuth()  
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [schedule, setSchedule] = useState<Course[]>([]);
  const [storedID, setStored] = useState<string>("")
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState<Course>({
    name: '',
    day: 'Monday',
    time: '',
    category: 'calculation',
    intensity: 'mid',
    startTime: '',
    endTime: ''
    });
   const [grouped, setGrouped] = useState<Record<Weekday, Course[]>>({
          Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [],
    });  
    const [priorityGrouped, setPriorityGrouped] = useState<Record<Weekday, Course[]>>({
        Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [],
    });

  const steps = [
    { id: 1, title: "Input Courses", description: "Add courses with intensity and category", completed: true },
    { id: 2, title: "Chat with AI", description: "Get personalized study time recommendations", completed: false },
    { id: 3, title: "Generate Timetable", description: "Create your optimized schedule", completed: false },
  ]

// --- Logic for Sorting and Grouping ---
    useEffect(() => {
        const priorityOrder = ["hard", "both-hard-bulky", "hard-to-grasp", "mid", "bulky", "easy"];

        const newGrouped: Record<Weekday, Course[]> = {
            Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: []
        };

        const unsortedGrouped: Record<Weekday, Course[]> = {
            Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: []
        };

        schedule.forEach((item) => {
            newGrouped[item.day].push(item);       // For sorting
            unsortedGrouped[item.day].push(item);  // For raw view
        });

        for (const day in newGrouped) {
            newGrouped[day as Weekday].sort((a, b) => {
                const priorityA = priorityOrder.indexOf(a.intensity);
                const priorityB = priorityOrder.indexOf(b.intensity);
                return priorityA - priorityB;
            });
        }

        setGrouped(unsortedGrouped);
        setPriorityGrouped(newGrouped);
    }, [schedule]);

    useEffect(()=>{
       const saved = localStorage.getItem('session');
       if(saved){
        const { chatId,sessionId } = JSON.parse(saved);
        console.log("ID Gotten:",chatId,sessionId)
        setStored(sessionId);
       }
    },[])

    function handleCategoryChange(category: Course['category']) {
        let defaultIntensity: Course['intensity'] = 'mid';
        if (category === 'theory') {
            defaultIntensity = 'bulky';
        }
        setForm({ ...form, category, intensity: defaultIntensity });
    }
    function handleIntensityChange(value: Course['intensity']) {
        setForm({ ...form, intensity: value });
    }
    
    function handleAdd() {
        setSchedule([...schedule, form]);
        setForm({
            name: '',
            day: 'Monday',
            time: '',
            category: 'calculation',
            intensity: 'mid',
            startTime:'',
            endTime:''
        });
    }

    const resume = () => {
      if (storedID){
        setOpen(true);
      }else{
         handleScheduleDay("New")
      }
    }

    const newChat = () => {
        const emptyValue = "New"; // Define the new value
        setStored(emptyValue);
        setOpen(false);
        handleScheduleDay(emptyValue)
      console.log("Info",storedID)
    }

    async function handleScheduleDay(response:string) {
        console.log(`Starting AI conversation for Student with:`);
        if(storedID === response){
          const chatData = {
            user:userId,
            storedID,
            };
            localStorage.setItem('ai-chat-data', JSON.stringify(chatData));
            router.push(`/chat/${storedID}`);
        }else{
              const { data: sess, error } = await supabase
                .from("chat_sessions")
                .insert({user_id:userId, title: `Chat for ` })
                .select()
                .single();
                if(sess){
                  const chatData = {
                      priorityGrouped,
                      grouped
                  };
                    localStorage.setItem('ai-chat-data', JSON.stringify(chatData));
                    router.push(`/chat/${sess.id}`);
                  }
      }
        }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Timetable Generator</span>
            </div>
          </div>
        </div>
      </header>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <span></span>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Continue Previous Chat?</DialogTitle>
          <DialogDescription>
            It looks like you have an ongoing conversation. What would you like to do?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 text-center">
          <h2 className="text-lg font-semibold mb-2">You have already started a chat.</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Do you want to continue it or start a new one?</p>
        </div>

        <DialogFooter className="flex items-center justify-between gap-2 py-2">
          <Button
            type="button"
            variant="outline"
            onClick={newChat}
          >
            Start New
          </Button>
          <Button
            type="button"
            onClick={() => {
              setOpen(false);
              handleScheduleDay(storedID);
            }}
          >
            Continue Chat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
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
                  <span>Step {currentStep} of 3</span>
                </div>
                <Progress value={(currentStep / 3) * 100} className="h-3" />
              </div>

              {/* Steps */}
              <div className="grid md:grid-cols-3 gap-6">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      step.id === currentStep
                        ? "border-blue-500 bg-blue-50"
                        : step.completed
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          step.completed
                            ? "bg-green-500 text-white"
                            : step.id === currentStep
                              ? "bg-blue-500 text-white"
                              : "bg-gray-300 text-gray-600"
                        }`}
                      >
                        {step.completed ? <CheckCircle2 className="h-4 w-4" /> : step.id}
                      </div>
                      <h3 className="font-medium">{step.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Step Content */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Step 1: Course Input Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span>Step 1: Courses Added Successfully</span>
                    </div>
                    <div>
                        <Button onClick={handleAdd}> 
                            <PlusCircle/> Add Course
                        </Button>
                    </div>
                </CardTitle>
                <CardDescription>
                  Add courses with their intensity levels and categories. Review them below.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between gap-4">
                    <div className="space-y-4 w-full">
                        <div className="grid grid-cols-2 gap-4 w-full">
                            <Input
                                placeholder="Course Name e.g MTH"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full"
                            />
                            <Input
                                placeholder="e.g 10am to 12pm or 10am - 12pm"
                                value={form.time}
                                onChange={(e) => setForm({ ...form, time: e.target.value })}
                                className="w-full"
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4 w-full">
                            <select
                                value={form.day}
                                onChange={(e) => setForm({ ...form, day: e.target.value as Weekday })}
                                className="w-full p-2 border rounded-md bg-white"
                            >
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                                    <option key={day} value={day}>{day}</option>
                                ))}
                            </select>
                            <select
                                value={form.category}
                                onChange={(e) => handleCategoryChange(e.target.value as Course['category'])}
                                className="w-full p-2 border rounded-md bg-white"
                            >
                                {['calculation', 'coding', 'theory'].map((category) => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                            <select 
                                value={form.intensity}
                                onChange={(e) => handleIntensityChange(e.target.value as Course['intensity'])}
                                className="w-full p-2 border rounded-md bg-white"
                            >
                                {form.category === 'calculation' || form.category === 'coding' ? (
                                    ['hard', 'mid', 'easy'].map((condition) => (
                                        <option key={condition} value={condition}>{condition}</option>
                                    ))
                                ) : (
                                    ['hard-to-grasp', 'bulky', 'easy', 'both-hard-bulky'].map((condition) => (
                                        <option key={condition} value={condition}>{condition}</option>
                                    ))
                                )}
                            </select>
                        </div>
                        <div className="flex justify-between">
                            {/* Schedule Display */}
                            {(['Monday' , 'Tuesday' ,'Wednesday' , 'Thursday' , 'Friday'] as Weekday[]).map((day)=> (
                                <div key={day} className="mb-4">
                                    <h2 className="font-bold text-lg">{day}</h2>
                                    {grouped[day].length > 0 ? (
                                        <ul className="list-disc ml-6">
                                            {grouped[day].map((item,index)=>(
                                                <li key={index}>
                                                    {item.name}
                                                </li>
                                            ))}
                                        </ul>
                                    ):(
                                        <p className="text-sm text-gray-500 ml-2">No classes</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                  {/* {courses.map((course, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                      <div>
                        <h4 className="font-medium">{course.name}</h4>
                        <p className="text-sm text-gray-600">
                          {course.code} • {course.units} units
                        </p>
                      </div>
                      <div className="flex space-x-2">
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
                        <Badge variant="outline">{course.category}</Badge>
                      </div>
                    </div>
                  ))} */}
                </div>
                {/* <div className="flex justify-between items-center mt-6">
                  <Link href="/timetable-generator/courses">
                    <Button variant="outline">Edit Courses</Button>
                  </Link>
                  <Button onClick={() => setCurrentStep(2)}>
                    Continue to AI Chat
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div> */}
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Step 2: AI Chat */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  <span>Step 2: Chat with AI for Time Recommendations</span>
                </CardTitle>
                <CardDescription>
                  Discuss your study preferences and get personalized time recommendations from our AI assistant.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <MessageSquare className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Ready to Chat with AI?</h3>
                  <p className="text-gray-600 mb-6">
                    Our AI will analyze your courses and help determine the best study times based on:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 text-left mb-6">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-sm">Course intensity levels</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-sm">Your daily schedule preferences</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-sm">Peak focus hours</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-sm">Break and review sessions</span>
                      </div>
                    </div>
                  </div>
                    <Button size="lg" onClick={resume}>
                      Start AI Chat
                      <MessageSquare className="ml-2 h-4 w-4" />
                    </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            {/* Step 3: Generate Timetable */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-green-500" />
                  <span>Step 3: Generate Your Timetable</span>
                </CardTitle>
                <CardDescription>
                  Based on your courses and AI recommendations, generate your personalized study timetable.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <Calendar className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Ready to Generate Your Timetable!</h3>
                  <p className="text-gray-600 mb-6">All information has been collected. Your timetable will include:</p>
                  <div className="grid md:grid-cols-2 gap-4 text-left mb-6">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        <span className="text-sm">Optimized study times</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        <span className="text-sm">Regular break intervals</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        <span className="text-sm">Review and practice sessions</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        <span className="text-sm">Weekly schedule format</span>
                      </div>
                    </div>
                  </div>
                  <Link href="/timetable-generator/result">
                    <Button size="lg" className="bg-green-600 hover:bg-green-700">
                      Generate Timetable
                      <Calendar className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous Step
          </Button>
          <div className="text-sm text-gray-500">Step {currentStep} of 3</div>
          <Button onClick={() => setCurrentStep(Math.min(3, currentStep + 1))} disabled={currentStep === 3}>
            Next Step
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
