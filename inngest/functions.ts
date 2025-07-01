import { supabase } from "@/supabaseClient";
import { inngest } from "./client";
import { createAgent, gemini } from '@inngest/agent-kit';


export function createAiTimeTableAgent({ day, courseNames }: { day: string, courseNames: string }) {
  return createAgent({
    name: "TimeTable Agent",
    description: "Provides tailored timetable for students in university",
    system: `You are a friendly, encouraging, and faith-driven university scheduling assistant.
    Your goal is to help a student prepare by creating a **study timetable for the day *before* their classes**.  
    If the student has MTH and CMP on Monday, they should study MTH and CMP on **Sunday**.
    You are given the following:
    - **Class Day**: ${day}
    - **Courses on that day**: ${courseNames}
    Your job is to:
    1. Automatically determine the **previous day** (the day before ${day}).
    2. Create a study schedule for that previous day.
    Guidelines:
    - Allocate 1–2 hours per subject.
    - Ask the student if they have any fixed events, appointments, or sports to avoid scheduling conflicts.
    - Optimize the schedule to be realistic and balanced.
    - Be polite, encouraging, and reflect a Christian attitude toward discipline, planning, and growth.
    Once you have enough details, respond with the full schedule using this format (repeat this block for each time period):
    **Day:** Sunday  
    **Start Time:** 6:00 PM  
    **End Time:** 7:30 PM  
    **Courses:** MTH
    ⚠️ Stick to this format exactly and include it **only after** enough information has been gathered.`,
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
      const { day, courseNames, message } = userInput;

      const promptKey = JSON.stringify({ day, courseNames, message });

      // Check Supabase cache first
      const { data: existing, error } = await supabase
        .from("prompt_cache")
        .select("reponse")
        .eq("prompt_key", promptKey)
        .single();

      if (existing) {
        console.log("✅ Using cached response from Supabase ");
        return existing.reponse;
      }else{
        //Not in cache then Run agent
        const agent = createAiTimeTableAgent({ day, courseNames });
        // Convert array of messages into plain text history
        const conversation = message.map((m: { role: string; content: any }) =>
          `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`
        ).join("\n\n");

       const result = await agent.run(conversation);
        // Save to cache
        await supabase.from("prompt_cache").insert({
          prompt_key: promptKey,
          reponse: result,
        });
  
        return result;
      }

    }
  );

