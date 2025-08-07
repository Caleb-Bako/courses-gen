import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export function createServerSupabaseClient(usertoken?:string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      async accessToken() {
        const token = (await auth()).getToken();
        const tokens = usertoken ?? token;
        return tokens
      },
    },
  )
}
//const token = await auth().getToken();