"use client"

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { useMealSuggestions } from '@/hooks/useMealSuggestions'

type AuthContextType = {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

function MealSuggestionsComponent() {
  const { suggestions, loading, error, fetchSuggestions } = useMealSuggestions()

  const handleGetSuggestions = async () => {
    // Example fridge items
    const fridgeItems = ['chicken', 'broccoli', 'rice']
    await fetchSuggestions(fridgeItems)
  }

  return (
    <div>
      <button onClick={handleGetSuggestions} disabled={loading}>
        {loading ? 'Getting suggestions...' : 'Get meal suggestions'}
      </button>
      
      {error && <p>Error: {error.message}</p>}
      
      {suggestions.length > 0 && (
        <ul>
          {suggestions.map((suggestion, index) => (
            <li key={suggestion.id || index}>
              <h3>{suggestion.name}</h3>
              <p>{suggestion.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
} 