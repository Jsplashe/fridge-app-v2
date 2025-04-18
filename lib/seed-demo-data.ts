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
const DEMO_USER_PASSWORD = 'demo123456'

// Helper function to wait
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function seedDemoData() {
  // Try to sign in first
  let { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
    email: DEMO_USER_EMAIL,
    password: DEMO_USER_PASSWORD,
  })

  // If sign in fails, create the demo user
  if (signInError) {
    console.log('Demo user not found, attempting to create...')
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: DEMO_USER_EMAIL,
        password: DEMO_USER_PASSWORD,
      })

      if (signUpError) {
        if (signUpError.message.includes('rate limit')) {
          console.log('Rate limited, waiting 40 seconds before retrying...')
          await wait(40000)
          const retryResult = await supabase.auth.signUp({
            email: DEMO_USER_EMAIL,
            password: DEMO_USER_PASSWORD,
          })
          if (retryResult.error) {
            console.error('Failed to create demo user after retry:', retryResult.error)
            return
          }
          user = retryResult.data.user
        } else {
          console.error('Failed to create demo user:', signUpError)
          return
        }
      } else {
        user = signUpData.user
      }
      console.log('Demo user created successfully')
    } catch (error) {
      console.error('Unexpected error creating demo user:', error)
      return
    }
  }

  if (!user) {
    console.error('Failed to get or create demo user')
    return
  }

  // Sample inventory items
  const inventoryItems = [
    {
      user_id: user.id,
      item_name: 'Milk',
      quantity: 1,
      expiry_date: '2024-04-15',
      category: 'Dairy'
    },
    {
      user_id: user.id,
      item_name: 'Eggs',
      quantity: 12,
      expiry_date: '2024-04-20',
      category: 'Dairy'
    },
    {
      user_id: user.id,
      item_name: 'Bread',
      quantity: 1,
      expiry_date: '2024-04-12',
      category: 'Bakery'
    },
    {
      user_id: user.id,
      item_name: 'Chicken',
      quantity: 2,
      expiry_date: '2024-04-10',
      category: 'Meat'
    }
  ]

  // Sample shopping list items
  const shoppingItems = [
    {
      user_id: user.id,
      item_name: 'Butter',
      quantity: 1
    },
    {
      user_id: user.id,
      item_name: 'Orange Juice',
      quantity: 1
    },
    {
      user_id: user.id,
      item_name: 'Apples',
      quantity: 6
    }
  ]

  // Sample meal plans
  const mealPlans = [
    {
      user_id: user.id,
      meal_name: 'Chicken Stir Fry',
      day_of_week: 'Monday'
    },
    {
      user_id: user.id,
      meal_name: 'Pasta with Tomato Sauce',
      day_of_week: 'Wednesday'
    },
    {
      user_id: user.id,
      meal_name: 'Grilled Salmon',
      day_of_week: 'Friday'
    }
  ]

  // Insert inventory items
  for (const item of inventoryItems) {
    const { error } = await supabase
      .from('inventory')
      .insert(item)
    if (error) {
      console.error('Failed to insert inventory item:', error.message, error.details, error.hint)
    }
  }

  // Insert shopping list items
  for (const item of shoppingItems) {
    const { error } = await supabase
      .from('shopping_list')
      .insert(item)
    if (error) {
      console.error('Failed to insert shopping list item:', error.message, error.details, error.hint)
    }
  }

  // Insert meal plans
  for (const meal of mealPlans) {
    const { error } = await supabase
      .from('meal_plans')
      .insert(meal)
    if (error) {
      console.error('Failed to insert meal plan:', error.message, error.details, error.hint)
    }
  }

  console.log('Demo data seeded successfully!')
}

// Execute immediately
seedDemoData()
  .then(() => {
    console.log('Demo data seeding completed successfully')
    process.exit(0)
  })
  .catch((error: unknown) => {
    console.error('Error seeding demo data:', error)
    process.exit(1)
  }) 