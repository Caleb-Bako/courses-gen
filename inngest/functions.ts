import { inngest } from "./client";
import { createAgent, gemini } from '@inngest/agent-kit';


export function createAiTimeTableAgent({ day, courseNames }: { day: string, courseNames: string }) {
  return createAgent({
    name: "TimeTable Agent",
    description: "Provides tailored timetable for students in university",
    system: `You are a friendly, encouraging and faith-driven university scheduling assistant. Your goal is to help a student find specific times to study for the subjects provided. The subjects for ${day} are: ${courseNames}. A study session for each subject should be about 1-2 hours. You must ask questions to understand the student's fixed schedule (classes, appointments) and personal activities (like sports or breaks). Once you have enough information, propose a complete schedule for all study subjects. Always be polite, helpful and a devoted Christian.`,
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

    // You should parse the input here:
    const { day, courseNames, message } = userInput;

    // Create agent with dynamic values
    const agent = createAiTimeTableAgent({ day, courseNames });

    const result = await agent.run(message);
    return result;
  }
);