"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AIChatComponent from "./AIComponent";

type Weekday = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

interface Course {
    name: string;
    day: Weekday;
    category: 'calculation' | 'coding' | 'theory';
    intensity: 'hard' | 'easy' | 'mid' | 'hard-to-grasp' | 'bulky' | 'both-hard-bulky';
}

export default function Logic() {
    const [form, setForm] = useState<Course>({
        name: '',
        day: 'Monday',
        category: 'calculation',
        intensity: 'mid',
    });

    // This state will hold the courses for the day you want to schedule
    const [coursesToSchedule, setCoursesToSchedule] = useState<Course[]>([]);
    // NEW STATE: This will hold the day being scheduled
    const [dayToSchedule, setDayToSchedule] = useState<string>("");

    const [schedule, setSchedule] = useState<Course[]>([]);
    const [priorityGrouped, setPriorityGrouped] = useState<Record<Weekday, Course[]>>({
        Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [],
    });
    const [grouped, setGrouped] = useState<Record<Weekday, Course[]>>({
        Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [],
    });


    // --- Logic for Sorting and Grouping ---
    useEffect(() => {
        const priorityOrder = ["hard", "both-hard-bulky", "hard-to-grasp", "mid", "bulky", "easy"];

        const newGrouped: Record<Weekday, Course[]> = {
            Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [],
        };

        const unsortedGrouped: Record<Weekday, Course[]> = {
            Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [],
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



    function handleAdd() {
        setSchedule([...schedule, form]);
        setForm({
            name: '',
            day: 'Monday',
            category: 'calculation',
            intensity: 'mid',
        });
    }
    
    function handleIntensityChange(value: Course['intensity']) {
        setForm({ ...form, intensity: value });
    }
    
    function handleCategoryChange(category: Course['category']) {
        let defaultIntensity: Course['intensity'] = 'mid';
        if (category === 'theory') {
            defaultIntensity = 'bulky';
        }
        setForm({ ...form, category, intensity: defaultIntensity });
    }

    // --- Function to Start AI Conversation ---
    function handleScheduleDay(coursesForDay: Course[], day: string) {
        console.log(`Starting AI conversation for ${day} with:`, coursesForDay);
        setCoursesToSchedule(coursesForDay);
        setDayToSchedule(day);
    }

    return (
        <div className="p-6 max-w-2xl mx-auto font-sans bg-gray-50 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">Create Your Timetable</h1>
            <div className="space-y-4 mb-8 p-4 border rounded-lg bg-white">
                <Input
                    placeholder="Course Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full"
                />
                <div className="grid grid-cols-2 gap-4">
                    <select
                        value={form.day}
                        onChange={(e) => setForm({ ...form, day: e.target.value as Weekday })}
                        className="w-full p-2 border rounded-md bg-white"
                    >
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
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
                </div>
                
                 {/* Unified Intensity Dropdown */}
                 <div className="col-span-2">
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

                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleAdd}>
                    Add Class
                </Button>
            </div>

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

            {/* Generated Schedule Display */}
            <div className="space-y-4">
                    <h2 className="text-xl font-bold text-center text-gray-700">Your Sorted Weekly Plan</h2>
                    {Object.keys(priorityGrouped).map((day) => (
                        priorityGrouped[day as Weekday].length > 0 && (
                            <div key={day} className="mb-4 bg-white p-4 rounded-lg shadow">
                                <h3 className="font-bold text-lg text-gray-800">{day}</h3>
                                <ul className="list-decimal ml-6 mt-2 text-gray-600">
                                    {priorityGrouped[day as Weekday].map((item, index) => (
                                        <li key={index}>
                                            {item.name} <span className="text-xs text-gray-400">({item.intensity})</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button 
                                    className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white text-xs py-1"
                                    onClick={() => handleScheduleDay(priorityGrouped[day as Weekday], day)}
                                >
                                    Schedule This Day
                                </Button>
                            {coursesToSchedule.length > 0 && (
                                <AIChatComponent coursesForDay={priorityGrouped[day as Weekday]} day ={day} />
                            )}
                            </div>
                        )
                    ))}
                </div>
        </div>
    );
}
