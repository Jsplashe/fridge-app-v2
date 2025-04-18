import { RecipeSearchTest } from '@/components/RecipeSearchTest'

export default function RecipeSearchPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Recipe Search</h1>
      
      <div className="mb-6">
        <p className="text-gray-600">
          This page demonstrates the API integration with Spoonacular. 
          Enter a food or dish name to search for real recipes through the Spoonacular API.
        </p>
      </div>
      
      <RecipeSearchTest />
      
      <div className="mt-8 p-4 border rounded-lg bg-blue-50">
        <h3 className="font-medium mb-2">About this page</h3>
        <p>
          This page uses the <code>/api/find-real-recipes</code> endpoint to search for recipes 
          using the Spoonacular API. The endpoint was built to accept a POST request with a 
          <code>mealName</code> parameter.
        </p>
        
        <h4 className="font-medium mt-4 mb-2">Troubleshooting API Key Issues</h4>
        <div className="pl-4 border-l-2 border-blue-200">
          <p className="mb-2">If you're seeing API key errors, try the following:</p>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Check your <code>.env.local</code> file and verify that <code>RAPIDAPI_KEY</code> is set correctly</li>
            <li>Make sure you've subscribed to the Spoonacular API on RapidAPI</li>
            <li>Try restarting the server with <code>./restart.sh</code> to reload environment variables</li>
            <li>Check the server logs for more detailed error information</li>
          </ol>
        </div>
      </div>
    </div>
  )
} 