import { RealRecipesDemo } from '@/components/RealRecipesDemo'

export default function RealRecipesPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Real Recipes Hook</h1>
      
      <div className="mb-6">
        <p className="text-gray-600">
          This page demonstrates the <code>useRealRecipes</code> hook which provides an easy way to search for real recipes
          using the Spoonacular API. Try searching for recipes like "Chicken Alfredo", "Vegetable Curry", or "Chocolate Cake".
        </p>
      </div>
      
      <div className="mb-8">
        <RealRecipesDemo />
      </div>
      
      <div className="mt-8 p-4 border rounded-lg bg-blue-50">
        <h3 className="font-medium mb-2">How to Use the Hook</h3>
        <div className="bg-white p-4 rounded mb-4 font-mono text-sm">
          <pre>{`import { useRealRecipes } from '@/hooks/useRealRecipes'

// Inside your component
const { recipes, loading, error, findRecipe } = useRealRecipes()

// Call the function with a meal name
const handleSearch = async () => {
  await findRecipe("Chicken Alfredo")
  // Now 'recipes' state will contain the results
}`}</pre>
        </div>
        
        <h4 className="font-medium mb-2">Hook Features</h4>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>Manage loading states during API requests</li>
          <li>Handle and expose errors from the API</li>
          <li>Store and provide recipe results</li>
          <li>Toast notifications for search feedback</li>
          <li>Support for limiting the number of results</li>
        </ul>
      </div>
    </div>
  )
} 