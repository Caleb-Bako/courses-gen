"use client";

import { supabase } from "@/supabaseClient";
import { useState, FormEvent, useEffect } from "react";
import Markdown from 'react-markdown'

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
interface AIChatProps {
  coursesForDay: Course[];
  day: string;
  chatId:string;
}

interface Extract{
  Day:string; Course: string; Start: string; End: string
}
interface Table{
  Courses:Course[];
  Priority_Grouped:Course[];
  schedule: Extract[];
}

export default function AIChatComponent({ coursesForDay, day, chatId }: AIChatProps) {
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messageList, setMessageList] = useState<messages[]>([]);
  const [timeTable,setTimeTable] = useState<Table[]>([]);
  const courseNames = coursesForDay.map((course) => course.name).join(", ");

  // create a session if none exists + fetch messages
  useEffect(() => {
    const init = async () => {
      if (chatId) {
        createSession();
      }else{
      }
    };

    init();
  }, [chatId]);

  const createSession= async () => {
      await supabase
        .from("chat_sessions")
        .insert({id: chatId, title: `Chat for ${day}` })

      // if(session.id){
      //   const { data: oldMessages } = await supabase
      //     .from("chat_messages")
      //     .select("role, content")
      //     .eq("chat_id", chatId)
      //     .order("created_at", { ascending: true });
      //    console.log("Message found");
      //   setMessageList(
      //     (oldMessages || []).map((msg) => ({
      //         ...msg,
      //         type: "text",
      //     }))
      //     );
      // }  
    console.log("Session Created");
  }

  // After AI response is in, extract time
  useEffect(() => {
    if (messageList.length === 0) return;
    const last = messageList[messageList.length - 1];
    if (last.role !== "user") extractTime(last.content);
  }, [messageList]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!chatId) return;

    const userMsg = { content: input, role: "user", type: "text" };
    setMessageList((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // 1. Save user message to Supabase
    await supabase.from("chat_messages").insert({
      chat_id: chatId,
      role: "user",
      content: input,
    });

    // 2. Send to backend AI API
    const result = await fetch("api/ai-timtable-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userInput: {
          day,
          courseNames,
          message: [...messageList, userMsg],
        },
      }),
    });

    const json = await result.json();

    // 3. Save AI response to Supabase
    await supabase.from("chat_messages").insert({
      chat_id: chatId,
      role: "assistant",
      content: json.content,
    });

    // 4. Update UI
    setMessageList((prev) => [...prev, json]);
    setIsLoading(false);
  };

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

        updates[day].push({ Day:day, Course: course, Start: start, End: end });
      });

        await supabase
        .from("student_courses")
        .update({ schedule: updates })
        .eq("chat_id", chatId)
    console.log("✅ Stored all time blocks:", updates);

        const { data: table, error } = await supabase
        .from("student_courses")
        .select("Courses, Priority_Grouped, schedule")
        .eq("chat_id", chatId)

        if (table) {
          setTimeTable(table);
          console.log("DONE!!!",timeTable)

        }
    } else {
      console.log("❌ No time block found.");
    }

  };

  console.log(messageList)
  console.log("Table",timeTable)

  return (
    <div className="mt-8 p-4 border-2 border-dashed rounded-lg bg-blue-50 max-w-2xl mx-auto font-sans">
      <div>
        {messageList.map((message, index) => (
          <div key={index} className={`flex mb-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`p-3 rounded-lg ${message.role === "user" ? "bg-gray-200" : "bg-white"}`}>
              <Markdown>{message.content}</Markdown>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow p-3 border rounded-md"
          placeholder="e.g., I have football from 4pm to 6pm..."
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || input.trim() === ""}
          className="px-6 py-3 bg-blue-600 text-white rounded-md"
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </form>
      {/* TimeTable */}
        {/* <div>
          {timeTable?.map((tab)=>(  
            <div>
              {tab.schedule.map((tb, idx) => (
                <div key={idx} className="mb-2">
                  <p className="font-bold">{tb.Day}</p>
                  <div className="flex gap-2 ml-4">
                    <p>{tb.Course}</p>
                    <p>{tb.Start} - {tb.End}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div> */}
    </div>
  );
}


//I have classes from 8am to 3pm, football practice from 4pm to 6pm, dinner by 7pm and bedtime by 11pm. Which time is best for reading in the evening