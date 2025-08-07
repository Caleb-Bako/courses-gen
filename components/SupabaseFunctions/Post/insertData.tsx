'use server'
import { createServerSupabaseClient } from "@/supabase_cl";
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
type Update = {
  Day: string;
  Course: string;
  Start: string;
  End: string;
};

interface Timetable extends Record<Weekday, Course[]> {}
type UpdatesRecord = Record<Weekday, Update[]>;

 const supabase = createServerSupabaseClient()
    export async function insertMessage(sessionId: string, role: string, text: string) {
        try {
            await supabase.from("chat_messages").insert({
            chat_id: sessionId,
            role: role,
            content: text,
            })
        } catch (error: any) {
            console.error('Error adding message:', error.message)
            throw new Error('Failed to add message')
        }

    }

    export async function createSession(userId:string,title:string,table:string) {
        try {
           const { data: sess } =  await supabase
            .from("chat_sessions")
            .insert({ user_id: userId,title: title, table: table })
            .select()
            .single()
            return sess?.id;
        } catch (error: any) {
            console.error('Error creating session:', error.message)
            throw new Error('Failed to add session')
        }
    }

    export async function insertCourses(userId:string,grouped:Timetable,priorityGrouped:Timetable) {
        try {
            const { data: session } = await supabase
            .from("student_courses")
            .insert({
                chat_id: userId,
                Courses: grouped,
                Priority_Grouped: priorityGrouped,
            })
            .select()
            .single()
            return session?.id
        } catch (error: any) {
            console.error('Error creating session:', error.message)
            throw new Error('Failed to add session')
        }
    }

    export async function updateContent(updates:UpdatesRecord,tableId:string) {
        try {
            await supabase.from("student_courses").update({ schedule: updates }).eq("id", tableId)
        } catch (error: any) {
            console.error('Error creating session:', error.message)
            throw new Error('Failed to add session')
        }
    }
    export async function promptCaching(promptKey:string,result:object) {
        try {
            const{data, error} = await supabase.from("prompt_cache").insert({
            prompt_key: promptKey,
            reponse: result,
            });
            if (error) {
            console.error("Insert error:", error.message, error.details);
            } else {
            console.log("Done Caching:", data);
            }
        } catch (error: any) {
            console.error('Error creating session:', error.message)
            throw new Error('Failed to add session')
        }
    }