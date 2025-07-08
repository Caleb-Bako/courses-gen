import { supabase } from "@/supabaseClient";
import { inngest } from "./client";
import { createAgent, gemini } from '@inngest/agent-kit';
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


export function createAiTimeTableAgent({ allCourses }: { allCourses: string }) {
  return createAgent({
    name: "Multi-Day TimeTable Agent",
    description: "Generates tailored study timetables based on upcoming class schedules.",
    system: `You are a university scheduling assistant helping a student plan their studies the day *before* each class day.

You will receive the upcoming class schedule across the week. Your task is to:
1. For each class day (e.g., Monday), find the **day before** (e.g., Sunday).
2. Create a study schedule for that prior day based on the courses planned for the class day.
3. Allocate 1–2 hours per subject depending on intensity.
4. Encourage breaks and balance.
5. Ask if the student has fixed events on that day.
6. Maintain a polite, Christian tone and end with encouragement.

Courses for the week:
${allCourses}

📄 Format the final result like this (repeat for each session):

**Day:** Sunday  
**Start Time:** 4:00 PM  
**End Time:** 5:30 PM  
**Courses:** MTH101

Only respond after you’ve gathered enough context.`,
    model: gemini({
      model: "gemini-2.5-flash",
      apiKey: process.env.NEXT_PUBLIC_AI_API_KEY!,
    }),
  });
}


  export const AiTimeTableAgent = inngest.createFunction(
  { id: "AiTableAgent" },
  { event: "AiTableAgent" },
  async ({ event }) => {
    const { userInput } = event.data;
    const { priorityGrouped, message } = userInput;

    // Create stringified details for all days
    let allCourses = "";

    for (const day of Object.keys(priorityGrouped) as Weekday[]) {
      const courses = priorityGrouped[day];
      if (!courses || courses.length === 0) continue;

      const dayDetails = courses.map((course: Course) => {
        return `- Name: ${course.name}
        Day: ${course.day}
        Intensity: ${course.intensity}
        Category: ${course.category}
        Start Time: ${course.startTime || "Not set"}
        End Time: ${course.endTime || "Not set"}`;
              }).join("\n\n");

              allCourses += `\n\n🗓️ For ${day}:\n${dayDetails}\n`;
            }

    const promptKey = JSON.stringify({ allCourses, message });

    // Cache check
    const { data: existing, error } = await supabase
      .from("prompt_cache")
      .select("reponse")
      .eq("prompt_key", promptKey)
      .single();

    if (existing) {
      console.log("✅ Using cached response");
      return existing.reponse;
    }

    const agent = createAiTimeTableAgent({ allCourses });

    const conversation = message.map((m: { role: string; content: any }) =>
      `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`
    ).join("\n\n");

    const result = await agent.run(conversation);

    await supabase.from("prompt_cache").insert({
      prompt_key: promptKey,
      reponse: result,
    });

    return result;
  }
);


