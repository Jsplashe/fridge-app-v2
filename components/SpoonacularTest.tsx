'use client'

import { useState } from 'react'
import { toast } from '@/hooks/use-toast'

export function SpoonacularTest() {
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const testAPI = async () => {
    setTestStatus('loading')
    setMessage('')
    
    try {
      const response = await fetch('/api/spoonacular-test?verify=true')
      const data = await response.json()
      
      if (data.success) {
        setTestStatus('success')
        toast({
          title: "Success!",
          description: data.message,
        })
      } else {
        setTestStatus('error')
        toast({
          variant: "destructive",
          title: "API Error",
          description: data.message,
        })
      }
      
      setMessage(data.message)
    } catch (error) {
      setTestStatus('error')
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setMessage(errorMessage)
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: errorMessage,
      })
    }
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-medium mb-4">Spoonacular API Test</h3>
      
      <div className="mb-4">
        <button
          onClick={testAPI}
          disabled={testStatus === 'loading'}
          className={`px-4 py-2 rounded-md ${
            testStatus === 'loading' 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {testStatus === 'loading' ? 'Testing...' : 'Test API Connection'}
        </button>
      </div>
      
      {testStatus !== 'idle' && (
        <div className={`p-3 rounded-md ${
          testStatus === 'loading' ? 'bg-gray-100' :
          testStatus === 'success' ? 'bg-green-100 text-green-800' :
          'bg-red-100 text-red-800'
        }`}>
          <p className="text-sm">{message}</p>
          
          {testStatus === 'error' && (
            <p className="mt-2 text-sm">
              Please check your RapidAPI key in the <code>.env.local</code> file and ensure you've 
              subscribed to the Spoonacular API on RapidAPI.
            </p>
          )}
        </div>
      )}
    </div>
  )
} 