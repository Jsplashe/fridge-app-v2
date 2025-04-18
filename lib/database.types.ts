export type Inventory = {
  id: string
  user_id: string
  item_name: string
  quantity: number
  expiry_date: string
  category: string
  created_at: string
}

export type ShoppingList = {
  id: string
  user_id: string
  item_name: string
  quantity: number
  added_at: string
}

export type MealPlan = {
  id: string
  user_id: string
  meal_name: string
  day_of_week: string
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      inventory: {
        Row: Inventory
        Insert: Omit<Inventory, 'id' | 'created_at'>
        Update: Partial<Omit<Inventory, 'id' | 'created_at'>>
      }
      shopping_list: {
        Row: ShoppingList
        Insert: Omit<ShoppingList, 'id' | 'added_at'>
        Update: Partial<Omit<ShoppingList, 'id' | 'added_at'>>
      }
      meal_plans: {
        Row: MealPlan
        Insert: Omit<MealPlan, 'id' | 'created_at'>
        Update: Partial<Omit<MealPlan, 'id' | 'created_at'>>
      }
    }
  }
} 