import { createClient } from '@supabase/supabase-js';

const supabase = createClient("https://tneutyrfeftrwwuvvxlu.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZXV0eXJmZWZ0cnd3dXZ2eGx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjM2OTkyNywiZXhwIjoyMDU3OTQ1OTI3fQ.RzytcmdwBRcX_R5s1JjPJ6sIIzdId2JF0E8lTYSqr1w");

export default supabase;
