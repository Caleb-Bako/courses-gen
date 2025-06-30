"use client";

import { supabase } from "@/supabaseClient";
import { useState, FormEvent, useEffect } from "react";
import Markdown from 'react-markdown'

type messages = {
    content: string,
    role: string,
    type: string
}

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
interface AIChatProps {
  coursesForDay: Course[];
  day: string;
}

export default function AIChatComponent({ coursesForDay, day }: AIChatProps) {
  const [chatId, setChatId] = useState<string | null>(null);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messageList, setMessageList] = useState<messages[]>([]);

  const courseNames = coursesForDay.map((course) => course.name).join(", ");

  // 🔹 On mount, create a session if none exists + fetch messages
  useEffect(() => {
    const init = async () => {
      if (chatId !== null) {
        // 2. Fetch old messages (if any)
        const { data: oldMessages } = await supabase
          .from("chat_messages")
          .select("role, content")
          .eq("chat_id", chatId)
          .order("created_at", { ascending: true });
         console.log("Message found");
        setMessageList(
          (oldMessages || []).map((msg) => ({
              ...msg,
              type: "text",
          }))
          );
      }else{
        createSession();
      }
    };

    init();
  }, [chatId]);

  const createSession= async () => {
    const { data: session, error } = await supabase
        .from("chat_sessions")
        .insert({ title: `Chat for ${day}` })
        .select()
        .single();
        setChatId(session.id);
    console.log("Session Created");
  }

  // 🔹 After AI response is in, extract time
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

  const cleanText = (text: string) =>
    text.trim().replace(/\r\n/g, "\n").replace(/\n{2,}/g, "\n").replace(/\s{2,}/g, " ");

  const extractTime = (rawText: string) => {
    const text = cleanText(rawText);
    const match = text.match(
      /\*\*Start Time:\*\*\s*(.*?)\s*\n+\*\*End Time:\*\*\s*(.*?)\s*\n+\*\*Courses:\*\*\s*(.*)/i
    );

    if (match) {
      console.log("✅ Start:", match[1].trim());
      console.log("✅ End:", match[2].trim());
      console.log("✅ Courses:", match[3].trim());
    } else {
      console.log("❌ No time block found.");
    }
  };

  console.log(messageList)

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
    </div>
  );
}
