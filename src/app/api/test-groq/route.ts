import { NextResponse } from 'next/server';

export async function GET() {
  const groqApiKey = process.env.GROQ_API_KEY;
  
  if (!groqApiKey) {
    return NextResponse.json({ error: 'GROQ_API_KEY not set' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'user', content: 'Say hello' }
        ],
        max_tokens: 20
      })
    });

    const data = await response.json();
    
    return NextResponse.json({
      status: response.status,
      ok: response.ok,
      data: data,
      serverTime: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      serverTime: new Date().toISOString()
    });
  }
}
