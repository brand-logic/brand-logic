const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://rgunmzvbvsyxscwyrroa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJndW5tenZidnN5eHNjd3lycm9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NzA1NDMsImV4cCI6MjA4NjI0NjU0M30.ENaGikwOJfk2unet4IV0zJQ9dy_L6xpXp1cAoaD9vMo'
)

async function main() {
  const { data, error } = await supabase.storage.listBuckets()
  console.log('Buckets:', data)
  if (error) console.error('Error:', error)
}
main()
