import { SpoonacularTest } from '@/components/SpoonacularTest'

export default function ApiTestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">API Configuration Test</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-medium mb-4">Spoonacular API Status</h2>
          <p className="mb-4 text-gray-600">
            This test checks if your Spoonacular API key is correctly configured. 
            If the test fails, you need to update your <code>.env.local</code> file with a valid RapidAPI key.
          </p>
          <SpoonacularTest />
        </div>
        
        <div className="mt-8 p-4 border rounded-lg bg-blue-50">
          <h3 className="font-medium mb-2">Setup Instructions</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>Sign up for a RapidAPI account at <a href="https://rapidapi.com" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">rapidapi.com</a></li>
            <li>Subscribe to the <strong>Spoonacular Recipe - Food - Nutrition</strong> API (they have a free tier)</li>
            <li>Copy your API key from your RapidAPI dashboard</li>
            <li>Update the <code>RAPIDAPI_KEY</code> value in your <code>.env.local</code> file</li>
            <li>Restart your development server</li>
            <li>Return to this page and test the connection again</li>
          </ol>
        </div>
      </div>
    </div>
  )
} 