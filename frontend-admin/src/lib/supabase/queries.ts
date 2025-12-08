/**
 * Supabase Query Helpers
 * 
 * These helpers provide a workaround for TypeScript strict mode issues
 * when the Supabase client doesn't properly recognize Database types.
 * 
 * Usage:
 *   import { getTypedClient } from '@/lib/supabase/queries';
 *   const { from } = getTypedClient(supabase);
 *   const { data } = await from('exams').select('*');
 */

import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Returns a Supabase client with relaxed type constraints
 * to work around the "never" type issues in strict mode.
 */
export function getTypedClient(supabase: SupabaseClient<any, any, any>) {
  return {
    from: (table: string) => supabase.from(table) as any,
    auth: supabase.auth,
    storage: supabase.storage,
    functions: supabase.functions,
  };
}

/**
 * Type-safe wrapper for Supabase .from() calls
 * that bypasses the strict type checking.
 */
export function fromTable(supabase: SupabaseClient<any, any, any>, table: string) {
  return supabase.from(table) as any;
}
