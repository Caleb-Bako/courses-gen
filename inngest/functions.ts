import { supabase } from "@/supabaseClient";
import { inngest } from "./client";
import { createAgent, gemini } from '@inngest/agent-kit';
type Weekday = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
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


export function createAiTimeTableAgent({ allCourses }: { allCourses: string }) {
  return createAgent({
    name: "Multi-Day TimeTable Agent",
    description: "Generates tailored study timetables based on upcoming class schedules.",
   system: `You are a helpful and friendly Christian university scheduling assistant helping a student prepare for their upcoming classes.
    Here are all the student's classes for the week:
    ${allCourses}

    Your role is to:
    1. For each class day (e.g., Monday), create a study plan for the **day before** (e.g., Sunday).
    2. Assign 1–2 hours of study time **per subject**, depending on intensity.
    3. Spread study time across the evening (after classes or commitments).
    4. Encourage breaks and maintain a gentle, encouraging tone.
    5. Ask if the student has other commitments that may affect the plan.
    6. End with a word of Christian encouragement.

    ✍️ After a brief polite intro, format the actual schedule like this for each subject:

    **Day:** Sunday  
    **Start Time:** 4:00 PM  
    **End Time:** 5:30 PM  
    **Courses:** MTH101

    Repeat that format for each course/day.

    ⚠️ Do not skip any relevant study days. Include all courses. Only use the above format in the schedule section so it can be extracted later.
    `

,
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
  const userInput = event.data?.userInput ?? {};
  const { priorityGrouped, message } = userInput;

  if (!priorityGrouped || !message) {
    throw new Error("Missing required userInput fields (priorityGrouped, message)");
  }

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
        Start Time: ${course.Department || "Not set"}
        End Time: ${course.Level || "Not set"}`;
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


