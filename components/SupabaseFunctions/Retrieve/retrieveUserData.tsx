'use server'
import { createServerSupabaseClient } from "@/supabase_cl";

const supabase = createServerSupabaseClient();
export async function userSession(userId:string,tableName:string,id:string,select?:string){
    const col = select?? "*"
    try {
        const { data: historyData } = await supabase.from(tableName).select(col).eq(id, userId)
        return historyData;
    } catch (error: any) {
            console.error('Error adding message:', error.message)
            throw new Error('Failed to add message')
        }
}

export async function retrieveMessages(chatId:string,) {
    try {
        const { data: oldMessages } = await supabase
        .from("chat_messages")
        .select("role, content")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true })
        return oldMessages;
    } catch (error: any) {
        console.error('Error adding message:', error.message)
        throw new Error('Failed to add message')
    }
}

export async function retrieveTableId(id:string) {
    try {
        const { data: history } = await supabase
        .from("chat_sessions")
        .select("title")
        .eq("id", id)
        .select()
        .single()
        return history?.table
    } catch (error: any) {
        console.error('Error adding message:', error.message)
        throw new Error('Failed to add message')
    }
}
export async function retrieveTableData(id:string) {
    try {
        const { data} = await supabase.from("student_courses").select("Priority_Grouped, schedule").eq("id", id)
        return data;        
    } catch (error: any) {
        console.error('Error adding message:', error.message)
        throw new Error('Failed to add message')
    }

}
export async function retrieveResults(){
    try {
        const { data } = await supabase.from("student_courses").select("Courses")
        return data;
    } catch (error: any) {
        console.error('Error adding message:', error.message)
        throw new Error('Failed to add message')
    }
}