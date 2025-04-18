'use client'

import { useState } from 'react'
import { useRealRecipes } from '@/hooks/useRealRecipes'

export function RealRecipesDemo() {
  const { recipes, loading, error, findRecipe } = useRealRecipes()
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    await findRecipe(searchTerm)
  }

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-xl font-medium mb-4">Real Recipes Hook Demo</h2>
      
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter a meal name (e.g., Chicken Alfredo)"
            className="flex-1 p-2 border rounded"
            disabled={loading}
          />
          <button
            type="submit"
            className={`px-4 py-2 rounded ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Find Recipes'}
          </button>
        </div>
      </form>
      
      {error && (
        <div className="mb-4 p-3 border border-red-300 bg-red-50 rounded">
          <h3 className="font-medium text-red-800">Error</h3>
          <p className="text-red-700">{error.message}</p>
          {error.details && <p className="text-red-700 text-sm">{error.details}</p>}
        </div>
      )}
      
      {recipes.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Found {recipes.length} Recipes</h3>
          <ul className="space-y-2">
            {recipes.map(recipe => (
              <li key={recipe.id} className="p-3 border rounded hover:bg-gray-50">
                <div className="flex items-start">
                  {recipe.image && (
                    <img 
                      src={recipe.image} 
                      alt={recipe.title} 
                      className="w-16 h-16 object-cover rounded mr-3"
                    />
                  )}
                  <div>
                    <h4 className="font-medium">{recipe.title}</h4>
                    {recipe.readyInMinutes && (
                      <p className="text-sm text-gray-600">Ready in {recipe.readyInMinutes} minutes</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {!loading && !error && recipes.length === 0 && searchTerm && (
        <p className="text-gray-500 italic">No recipes found. Try a different search term.</p>
      )}
    </div>
  )
} 