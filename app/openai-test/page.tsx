'use client'

import { useState, useEffect } from 'react'
import { verifyOpenAISetup } from '@/lib/api/openai'
import { Button } from '@/components/ui/button'

export default function OpenAITestPage() {
  const [result, setResult] = useState<{ success?: boolean; message?: string }>({})
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    try {
      const verificationResult = await verifyOpenAISetup()
      setResult(verificationResult)
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="container px-4 py-8 pb-20 md:pb-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">OpenAI API Test</h1>
        
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">API Connection Test</h2>
          <p className="mb-4 text-gray-600">
            This page tests the connection to OpenAI's API using the gpt-3.5-turbo model.
            Click the button below to verify that your API key is properly configured.
          </p>
          
          <Button 
            onClick={testConnection} 
            disabled={loading}
            className="mb-6"
          >
            {loading ? 'Testing Connection...' : 'Test OpenAI Connection'}
          </Button>
          
          {result.message && (
            <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              <p className="font-medium">{result.success ? '✅ Success' : '❌ Error'}</p>
              <p>{result.message}</p>
            </div>
          )}
          
          <div className="mt-8 text-sm text-gray-500">
            <h3 className="font-medium mb-2">Troubleshooting Tips:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Ensure OPENAI_API_KEY is set in your environment variables</li>
              <li>Verify your API key has sufficient credits</li>
              <li>Check if there are any network restrictions blocking API access</li>
              <li>Ensure you're using a supported OpenAI API key format</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
} 