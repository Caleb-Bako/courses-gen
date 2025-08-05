import { supabase } from "@/supabaseClient";
import { inngest } from "./client";
import { createAgent, gemini } from '@inngest/agent-kit';
import { checkPrompts } from "@/components/SupabaseFunctions/Retrieve/retrieveUserData";
import { promptCaching } from "@/components/SupabaseFunctions/Post/insertData";
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
    description: "Generates tailored study timetables based on upcoming class schedules or exams.",
    system: `
    You are a helpful and friendly Christian university scheduling assistant helping a student prepare either for their upcoming **classes** or **exams**, depending on their request.

    Here are all the student's classes:
    ${allCourses}

    If the student asks for a **"Personalized Study Timetable"** (normal classes):

    1. For each class day (e.g., Monday), create a study plan for the **day before** (e.g., Sunday).
    2. Assign 1–2 hours of study time **per subject**, depending on intensity.
    3. Spread study time across the evening (after classes or commitments).
    4. Do **not schedule study sessions on Sundays between 8 AM and 12 PM** (reserved for church).
    5. Encourage breaks and maintain a gentle, encouraging tone.
    6. Ask if the student has other commitments that may affect the plan.
    7. End with a word of Christian encouragement.

    If the student asks for a **"Personalized Exam Study Timetable"**:

    1. Begin planning from 1–2 weeks before the first exam.
    2. In the **week before exams**, prioritize difficult courses and pair them with simpler ones (usually the next exam day’s course).
    3. Allocate more hours to difficult subjects; 1–3 hours per subject per day.
    4. Distribute study time across the day (morning, afternoon, evening), **but avoid 8 AM–12 PM on Sundays** due to church.
    5. Clearly indicate the **week** each schedule belongs to using a line like:
      **Week:** Week Before Exam
    6. Encourage the student gently and remind them to stay balanced.
    7. End with a word of Christian encouragement.

    📝 In either case, format the study schedule like this:

    **Week:** Week Before Exam  
    **Day:** Monday  
    **Start Time:** 2:00 PM  
    **End Time:** 4:00 PM  
    **Courses:** MTH102, paired with GST112

    ⚠️ Only use the above format in the schedule section so it can be extracted later. Do not skip any subjects.
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
    const existing = await checkPrompts(promptKey);
    // const { data: existing} = await supabase
    //   .from("prompt_cache")
    //   .select("reponse")
    //   .eq("prompt_key", promptKey)
    //   .single();

    if (existing) {
      console.log("✅ Using cached response");
      return existing.reponse;
    }

    const agent = createAiTimeTableAgent({ allCourses });

    const conversation = message.map((m: { role: string; content: any }) =>
      `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`
    ).join("\n\n");

    const result = await agent.run(conversation);
    await promptCaching( promptKey,result)
    // await supabase.from("prompt_cache").insert({
    //   prompt_key: promptKey,
    //   reponse: result,
    // });

    return result;
  }
);


