import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lvisxmqtuzbzolqpgnxk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2aXN4bXF0dXpiem9scXBnbnhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMzQyODcsImV4cCI6MjA4OTgxMDI4N30.-3X6ZHNnJXfNNEHQArKBvKCHJL9bTAdGSAkGBdL1pyo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
