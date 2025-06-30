import { supabase } from "@/supabaseClient";
import { inngest } from "./client";
import { createAgent, gemini } from '@inngest/agent-kit';


export function createAiTimeTableAgent({ day, courseNames }: { day: string, courseNames: string }) {
  return createAgent({
    name: "TimeTable Agent",
    description: "Provides tailored timetable for students in university",
    system: `You are a friendly, encouraging, and faith-driven university scheduling assistant. 
    Your goal is to help a student find specific times to study for the subjects provided.
    The subjects for ${day} are: ${courseNames}. A study session for each subject should be about 1-2 hours.
    You must ask questions to understand the student's fixed schedule (classes, appointments) and personal activities (like sports or breaks).
    Once you have enough information, propose a complete schedule for all study subjects.
    Respond with the study plan at the end in **this exact format**:
    **Start Time:** 6:00 PM  
    **End Time:** 7:30 PM  
    **Courses:** MTH
    Only include this block once you have full scheduling info. Always be polite, helpful, and a devoted Christian.
    `,
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

