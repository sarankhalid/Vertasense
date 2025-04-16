"use client";

import { liveProvider as liveProviderSupabase } from "@refinedev/supabase";
import { supabaseBrowserClient } from "@/utils/supabase/client";

export const liveProvider = liveProviderSupabase(supabaseBrowserClient);
