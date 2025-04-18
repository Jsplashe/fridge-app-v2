'use server'

import { redirect } from 'next/navigation'

export default function MealCalendarRedirect() {
  return redirect('/meal-planner')
}

