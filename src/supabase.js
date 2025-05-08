
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://jorizaqqovaimqwecxgb.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvcml6YXFxb3ZhaW1xd2VjeGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0MDUwNTQsImV4cCI6MjA2MTk4MTA1NH0.E8b2dJiWk5mM9m1tfuCbQtP_vtwHoBXpLvSqAOX87GE"
const supabase = createClient(supabaseUrl, supabaseKey)
export default supabase;