import { ApiError } from './apiErrors';

/**
 * Common error type for hooks to use
 * This provides better type safety than using Error | null
 */
export type HookError = ApiError | Error | null;

/**
 * Type for a hook's loading state
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Type for new inventory item with proper field definitions
 */
export type NewInventoryItem = {
  item_name: string;
  quantity: number;
  expiry_date: string;
  category: string;
  user_id?: string;
};

/**
 * Type for new shopping list item with proper field definitions
 */
export type NewShoppingListItem = {
  item_name: string;
  quantity: number;
  unit: string;
  category?: string;
  user_id?: string;
};

/**
 * Type for new meal plan with proper field definitions 
 */
export type NewMealPlan = {
  meal_name: string;
  day_of_week: string;
  user_id?: string;
};

/**
 * Type-safe form errors
 */
export type FormErrors<T> = Partial<Record<keyof T, string>>; 