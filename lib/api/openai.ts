/**
 * OpenAI API client
 * 
 * This module provides functions to interact with OpenAI's API
 */

// Check for API key in environment variables
const getOpenAIKey = () => {
  const key = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  
  if (!key) {
    console.warn('Missing OpenAI API key in environment variables');
  } else {
    console.log('OpenAI API key found, length:', key.length);
  }
  
  return key;
};

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: Message;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Send a chat completion request to OpenAI
 * @param messages Array of messages for the conversation
 * @param options Additional options for the API call
 * @returns The response from OpenAI
 */
export async function createChatCompletion(
  messages: Message[],
  options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  }
): Promise<ChatCompletionResponse> {
  const OPENAI_API_KEY = getOpenAIKey();
  
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured. Please add OPENAI_API_KEY to your .env.local file.');
  }

  const { model = 'gpt-3.5-turbo', temperature = 0.7, max_tokens = 500 } = options || {};

  try {
    console.log(`Making OpenAI API request to model: ${model}`);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(e => {
        console.error('Error parsing OpenAI error response:', e);
        return { error: { message: `HTTP error ${response.status}: ${response.statusText}` } };
      });
      
      console.error('OpenAI API error response:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('OpenAI API request successful, tokens used:', data.usage?.total_tokens || 'unknown');
    
    return data;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}

/**
 * Verify the OpenAI API setup with a simple test request
 * @returns A success message if verification passes
 */
export async function verifyOpenAISetup(): Promise<{ success: boolean; message: string }> {
  try {
    const result = await createChatCompletion([
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Say "OpenAI connection successful" if you can read this message.' }
    ]);

    const response = result.choices[0]?.message?.content;
    
    return {
      success: true,
      message: `API verification successful. Response: ${response}`
    };
  } catch (error) {
    return {
      success: false,
      message: `API verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
} 