
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey)
export default supabase;
// import { createClient } from '@supabase/supabase-js'
// const supabaseUrl = 'https://mhlhztcaqrubhzyekrbz.supabase.co'
// const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1obGh6dGNhcXJ1Ymh6eWVrcmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MDg5MTAsImV4cCI6MjA2MjM4NDkxMH0.xuee3s7h_8h-dsE6HcBtrvHPIwH91K6QminNJmIbniw"
// const supabase = createClient(supabaseUrl, supabaseKey)
// export default supabase;

