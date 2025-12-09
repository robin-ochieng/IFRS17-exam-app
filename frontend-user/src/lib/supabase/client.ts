import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  if (client) return client;
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('Supabase Client: Creating client with URL:', url ? url.substring(0, 30) + '...' : 'MISSING');
  console.log('Supabase Client: Anon key present:', !!key);
  
  if (!url || !key) {
    console.error('Missing Supabase environment variables:', { url: !!url, key: !!key });
    throw new Error('Supabase configuration missing. Please check your environment variables.');
  }
  
  client = createBrowserClient<Database>(url, key);
  return client;
}
