// Simple script to test OpenAI API connection
require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;

async function testOpenAIConnection() {
  if (!OPENAI_API_KEY) {
    console.error("❌ Error: No OpenAI API key found in environment variables");
    console.log("Please make sure you've added your API key to .env file");
    return;
  }

  console.log("Testing OpenAI API connection...");
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say "OpenAI connection successful" if you can read this message.' }
        ],
        temperature: 0.7,
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const result = await response.json();
    const message = result.choices[0]?.message?.content;
    
    console.log("✅ Success: API connection working correctly!");
    console.log(`Response: ${message}`);
  } catch (error) {
    console.error("❌ Error testing OpenAI API connection:");
    console.error(error.message);
    if (error.message.includes('invalid_api_key')) {
      console.log("\nThe API key you provided appears to be invalid. Please check it and try again.");
    }
  }
}

testOpenAIConnection(); 