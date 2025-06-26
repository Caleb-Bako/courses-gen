"use client";

import { useState, useEffect, FormEvent } from "react";
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
    category: 'calculation' | 'coding' | 'theory';
    intensity: 'hard' | 'easy' | 'mid' | 'hard-to-grasp' | 'bulky' | 'both-hard-bulky';
}
interface AIChatProps {
  coursesForDay: Course[];
  day: string;
}

export default function AIChatComponent({ coursesForDay, day }: AIChatProps) {
    const [input, setInput] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [messageList, setMessageList] = useState<messages[]>([]);

    
    const handleSubmit = async (e: FormEvent) => {
        const courseNames = coursesForDay.map(course => course.name).join(", ");
        e.preventDefault(); 
        setIsLoading(true);
        setMessageList(prev=>[...prev,{
            content: input,
            role: 'user',
            type: 'text'
        }])
        const result = await fetch('api/ai-timtable-chat',{
            method:'POST',
            headers: {
                    'Content-Type': 'application/json',
                },
            body: JSON.stringify({
                userInput: {
                    day: day,
                    courseNames: courseNames,
                    message: input
                }
            })
        })
        const json = await result.json();
        setMessageList(prev=>[...prev,json])
        setInput("");
        setIsLoading(false);
    };

    console.log(messageList);

    return (
        <div className="mt-8 p-4 border-2 border-dashed rounded-lg bg-blue-50 max-w-2xl mx-auto font-sans">
            <div>
                {messageList?.map((message,index)=>(
                    <div key={index} className={`flex mb-2 ${message.role == 'user' ?'justify-end':'justify-start'}`}>
                        <div className={`p-3 rounded-lg gap-2 ${message.role=='user' ? 'bg-gray-200 text-black rounded-lg':'bg-gray-50 text-black'}`}>
                            <Markdown>{message.content}</Markdown> 
                        </div>
                    </div>
                    ))}
            </div>
            {/* Chat input form */}
            <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
                <input
                    className="flex-grow p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    value={input}
                    placeholder="e.g., I have practice from 4pm to 6pm..."
                    onChange={(e) => setInput(e.target.value)} 
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 shadow-md"
                    disabled={isLoading || input.trim() === ""} 
                >
                    {isLoading ? "Sending..." : "Send"}
                </button>
            </form>
        </div>
    );
}
