import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// Configure environment variables
config()

// ESM module context
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

const DEMO_USER_EMAIL = 'demo@fridgeapp.com'

async function confirmDemoEmail() {
  console.log('Attempting to confirm demo user email...')
  
  // First, try to sign in to check if the user exists
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: DEMO_USER_EMAIL,
    password: 'demo123456',
  })
  
  if (signInError) {
    console.error('Error signing in:', signInError.message)
    return
  }
  
  console.log('Demo user found, checking email confirmation status...')
  
  // Check if email is already confirmed
  if (signInData.user?.email_confirmed_at) {
    console.log('Email is already confirmed')
    return
  }
  
  // Since we can't directly update the email_confirmed_at field with the client,
  // we'll need to use the Supabase dashboard or SQL editor to run:
  // update auth.users set email_confirmed_at = now() where email = 'demo@fridgeapp.com';
  
  console.log(`
To confirm the demo user's email, please run the following SQL in your Supabase SQL Editor:

update auth.users set email_confirmed_at = now() where email = 'demo@fridgeapp.com';
  `)
}

// Execute immediately
confirmDemoEmail()
  .then(() => {
    console.log('Script completed')
    process.exit(0)
  })
  .catch((error: unknown) => {
    console.error('Error:', error)
    process.exit(1)
  }) 