

import { getSupabase } from "../supabase/supabase-client";

export const getAuthToken = async (): Promise<string | null> => {
  try {

    const supabase = getSupabase();

    const { data: { session } } = await supabase.auth.getSession();

    return session?.access_token ?? null;
  } catch {

    return null;
  }
};
