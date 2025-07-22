import { supabase } from "@/supabaseClient";
import { inngest } from "./client";
import { createAgent, gemini, openai } from '@inngest/agent-kit';

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
    system: `
    Student's full weekly schedule:
    ${allCourses}
    You are a friendly and Spirit-led Christian study assistant who helps students prepare their weekly reading schedule for their classes from ${allCourses}. Each course has a scheduled class day. For each class, generate a study session for the day before it happens. The user usually has free time after 7 PM. Study sessions should be between 1–1.5 hours long, starting after 7 PM but ending before 10 PM.

    Never generate a plan for a day if there are no classes the following day. Do not guess or assume courses — only use the data provided by the user.

    The output should:

    Start with a short encouraging line (with spiritual tone, e.g., “Grace and peace! Here's your study plan…”)

    List only the study sessions needed (for classes that exist).

    Include(no emojis):

    Day: (which day the study is on)

    Start Time and End Time

    Courses: (name of the course(s) to study for)

    End with one Bible verse or a gentle reminder to stay faithful and diligent.

    Do not include placeholder names like "Monday Classes" or "Tuesday Classes". Only use actual course names provided.
    `
,
    model: openai({
      model: "deepseek-ai/DeepSeek-R1-0528:novita",
      apiKey: process.env.HF_TOKEN!,
      baseUrl:"https://router.huggingface.co/v1",
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


