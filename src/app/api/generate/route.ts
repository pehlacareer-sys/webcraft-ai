// Generate API - AI code generation endpoint with Queue System
import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are an expert web developer. Generate complete, working HTML code.

CRITICAL RULES:
1. Return ONLY valid HTML code - no explanations, no markdown
2. Always complete ALL code - never cut off mid-generation
3. Include: <!DOCTYPE html>, <html>, <head>, <body> tags
4. Use Tailwind CSS via: <script src="https://cdn.tailwindcss.com"></script>
5. Keep it simple and complete
6. Use green/emerald colors for accents (not blue/purple)
7. Close all HTML tags properly

Format: Start with <!DOCTYPE html> and end with </html>`;

// ============================================
// API POOL & QUEUE MANAGEMENT SYSTEM
// ============================================

interface APIProvider {
  name: string;
  apiKey: string;
  inUse: boolean;
  requestCount: number;
  lastUsed: number;
}

interface QueueItem {
  prompt: string;
  sessionId: string;
  resolve: (value: { code: string; provider: string }) => void;
  reject: (error: Error) => void;
  timestamp: number;
}

// In-memory storage
const sessions = new Map<string, { messages: Array<{role: string, content: string}> }>();
const requestQueue: QueueItem[] = [];
let isProcessingQueue = false;

// API Provider Pool - tracks which providers are in use
class APIPool {
  private providers: Map<string, APIProvider> = new Map();
  private initialized = false;

  init() {
    if (this.initialized) return;
    
    // Initialize providers from environment
    if (process.env.OPENROUTER_API_KEY) {
      this.providers.set('openrouter', {
        name: 'OpenRouter',
        apiKey: process.env.OPENROUTER_API_KEY,
        inUse: false,
        requestCount: 0,
        lastUsed: 0
      });
    }
    
    if (process.env.GROQ_API_KEY) {
      this.providers.set('groq', {
        name: 'Groq',
        apiKey: process.env.GROQ_API_KEY,
        inUse: false,
        requestCount: 0,
        lastUsed: 0
      });
    }

    if (process.env.ZAI_API_KEY) {
      this.providers.set('zai', {
        name: 'Z.AI',
        apiKey: process.env.ZAI_API_KEY,
        inUse: false,
        requestCount: 0,
        lastUsed: 0
      });
    }
    
    this.initialized = true;
    console.log('[API Pool] Initialized with providers:', Array.from(this.providers.keys()));
  }

  // Get next available provider (priority: OpenRouter → Groq → Z.AI)
  getNextAvailable(): APIProvider | null {
    this.init();
    
    const priorityOrder = ['openrouter', 'groq', 'zai'];
    
    for (const providerId of priorityOrder) {
      const provider = this.providers.get(providerId);
      if (provider && !provider.inUse) {
        return provider;
      }
    }
    
    return null;
  }

  // Lock a provider for a user
  lock(providerId: string): boolean {
    const provider = this.providers.get(providerId);
    if (provider && !provider.inUse) {
      provider.inUse = true;
      provider.lastUsed = Date.now();
      console.log(`[API Pool] Locked provider: ${providerId}`);
      return true;
    }
    return false;
  }

  // Release a provider after use
  release(providerId: string) {
    const provider = this.providers.get(providerId);
    if (provider) {
      provider.inUse = false;
      provider.requestCount++;
      console.log(`[API Pool] Released provider: ${providerId}`);
      
      // Process next in queue
      processQueue();
    }
  }

  // Get pool status
  getStatus() {
    this.init();
    const status: Record<string, { available: boolean; requestCount: number }> = {};
    
    this.providers.forEach((provider, id) => {
      status[id] = {
        available: !provider.inUse,
        requestCount: provider.requestCount
      };
    });
    
    return status;
  }
}

const apiPool = new APIPool();

// ============================================
// API CALL FUNCTIONS
// ============================================

async function callOpenRouter(apiKey: string, prompt: string): Promise<string> {
  const freeModels = [
    'poolside/laguna-m.1:free',
    'deepseek/deepseek-v4-flash:free',
    'qwen/qwen3-next-80b-a3b-instruct:free',
    'google/gemma-4-31b-it:free',
  ];

  let lastError: Error | null = null;

  for (const model of freeModels) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://sitezora-ai.vercel.app',
          'X-Title': 'SiteZora AI'
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 8192
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`[OpenRouter] Model ${model} error:`, response.status, errorData);
        lastError = new Error(`OpenRouter error: ${response.status}`);
        continue;
      }

      const data = await response.json();
      console.log(`[OpenRouter] Success with model: ${model}`);
      return data.choices[0].message.content;
    } catch (error) {
      console.error(`[OpenRouter] Model ${model} failed:`, error);
      lastError = error as Error;
    }
  }

  throw lastError || new Error('All OpenRouter models failed');
}

async function callGroq(apiKey: string, prompt: string): Promise<string> {
  // Try multiple Groq models
  const models = [
    'llama-3.3-70b-versatile',
    'llama-3.1-70b-versatile',
    'mixtral-8x7b-32768'
  ];

  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 8192
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`[Groq] Model ${model} error:`, response.status, errorData);
        lastError = new Error(`Groq error: ${response.status}`);
        continue;
      }

      const data = await response.json();
      console.log(`[Groq] Success with model: ${model}`);
      return data.choices[0].message.content;
    } catch (error) {
      console.error(`[Groq] Model ${model} failed:`, error);
      lastError = error as Error;
    }
  }

  throw lastError || new Error('All Groq models failed');
}

async function callZAI(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch('https://api.z.ai/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'GLM-4.7-Flash',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 8192
    })
  });

  if (!response.ok) {
    throw new Error(`Z.AI API error: ${response.status}`);
  }

  const data = await response.json();
  console.log('[Z.AI] Success');
  return data.choices[0].message.content;
}

// ============================================
// CODE EXTRACTION
// ============================================

function extractCode(response: string): string {
  if (!response) return '';

  const htmlMatch = response.match(/```html\s*([\s\S]*?)```/);
  if (htmlMatch) return htmlMatch[1].trim();

  const codeMatch = response.match(/```(?:\w+)?\s*([\s\S]*?)```/);
  if (codeMatch) {
    const code = codeMatch[1].trim();
    if (code.includes('<!DOCTYPE') || code.includes('<html') || code.includes('<body')) {
      return code;
    }
  }

  const unclosedMatch = response.match(/```html\s*([\s\S]*?)$/);
  if (unclosedMatch) return unclosedMatch[1].trim();

  if (response.includes('<!DOCTYPE') || response.includes('<html')) {
    let code = response.replace(/^```(?:html)?\s*/i, '').replace(/```\s*$/i, '');
    return code.trim();
  }

  return response.trim();
}

// ============================================
// DEMO CODE GENERATOR
// ============================================

function generateDemoCode(prompt: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Website</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white">
  <section class="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
    <div class="max-w-4xl mx-auto text-center">
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-6">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        Demo Mode
      </div>
      <h1 class="text-5xl font-bold text-gray-900 mb-6">Your Website</h1>
      <p class="text-xl text-gray-600 mb-8">Prompt: "${prompt}"</p>
      <button class="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium">
        Get Started
      </button>
    </div>
  </section>
</body>
</html>`;
}

// ============================================
// QUEUE PROCESSING
// ============================================

async function processQueue() {
  if (isProcessingQueue || requestQueue.length === 0) return;
  
  const availableProvider = apiPool.getNextAvailable();
  if (!availableProvider) {
    console.log('[Queue] No available providers, waiting...');
    return;
  }

  isProcessingQueue = true;
  const item = requestQueue.shift();
  if (!item) {
    isProcessingQueue = false;
    return;
  }

  console.log(`[Queue] Processing request for session: ${item.sessionId}`);

  try {
    apiPool.lock(availableProvider.name.toLowerCase());
    
    let generatedCode = '';
    const providerId = availableProvider.name.toLowerCase();

    if (providerId === 'openrouter') {
      generatedCode = await callOpenRouter(availableProvider.apiKey, item.prompt);
    } else if (providerId === 'groq') {
      generatedCode = await callGroq(availableProvider.apiKey, item.prompt);
    } else if (providerId === 'zai') {
      generatedCode = await callZAI(availableProvider.apiKey, item.prompt);
    }

    const code = extractCode(generatedCode);
    item.resolve({ code, provider: availableProvider.name });
    
  } catch (error) {
    console.error(`[Queue] Error with ${availableProvider.name}:`, error);
    item.reject(error as Error);
  } finally {
    apiPool.release(availableProvider.name.toLowerCase());
    isProcessingQueue = false;
  }
}

// ============================================
// MAIN API HANDLER
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, sessionId, type = 'website', existingCode, figmaData } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Get or create session
    let session = sessionId ? sessions.get(sessionId) : null;
    const newSessionId = sessionId || `session_${Date.now()}`;
    
    if (!session) {
      session = { messages: [] };
      sessions.set(newSessionId, session);
    }

    // Build prompt with context
    let fullPrompt = prompt;
    const messages = session.messages || [];
    
    if (messages.length > 0) {
      const recentMessages = messages.slice(-6);
      let contextPrompt = 'Previous conversation context:\n\n';
      
      for (const msg of recentMessages) {
        if (msg.role === 'user') {
          contextPrompt += `User: ${msg.content}\n\n`;
        } else {
          contextPrompt += `Assistant: [Previous code generated]\n\n`;
        }
      }
      
      fullPrompt = contextPrompt + `Current request: ${prompt}`;
    }

    if (existingCode) {
      fullPrompt = `Existing code:\n\`\`\`html\n${existingCode}\n\`\`\`\n\nRequest: ${prompt}`;
    }

    if (figmaData) {
      fullPrompt = `Figma Design JSON:\n${figmaData}\n\nGenerate the website code. ${prompt}`;
    }

    // Check for available provider
    const availableProvider = apiPool.getNextAvailable();
    
    if (availableProvider) {
      // Process immediately
      apiPool.lock(availableProvider.name.toLowerCase());
      
      try {
        let generatedCode = '';
        const providerId = availableProvider.name.toLowerCase();

        if (providerId === 'openrouter') {
          generatedCode = await callOpenRouter(availableProvider.apiKey, fullPrompt);
        } else if (providerId === 'groq') {
          generatedCode = await callGroq(availableProvider.apiKey, fullPrompt);
        } else if (providerId === 'zai') {
          generatedCode = await callZAI(availableProvider.apiKey, fullPrompt);
        }

        const code = extractCode(generatedCode);
        
        // Update session
        session.messages = [
          ...messages,
          { role: 'user', content: prompt },
          { role: 'assistant', content: generatedCode }
        ];

        return NextResponse.json({
          success: true,
          code,
          sessionId: newSessionId,
          provider: availableProvider.name,
          queuePosition: 0,
          poolStatus: apiPool.getStatus()
        });

      } catch (error) {
        console.error(`[API] Error with ${availableProvider.name}:`, error);
        apiPool.release(availableProvider.name.toLowerCase());
        
        // Try next provider
        const nextProvider = apiPool.getNextAvailable();
        if (nextProvider) {
          // Recursively try next provider
          return POST(request);
        }
        
        // Fall back to demo mode
        const demoCode = generateDemoCode(prompt);
        return NextResponse.json({
          success: true,
          code: demoCode,
          sessionId: newSessionId,
          provider: 'Demo',
          demo: true,
          poolStatus: apiPool.getStatus()
        });
      } finally {
        apiPool.release(availableProvider.name.toLowerCase());
      }
    } else {
      // All providers busy - add to queue
      console.log('[API] All providers busy, adding to queue');
      
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          // If waiting too long, return demo mode
          const demoCode = generateDemoCode(prompt);
          resolve(NextResponse.json({
            success: true,
            code: demoCode,
            sessionId: newSessionId,
            provider: 'Demo',
            demo: true,
            message: 'APIs busy, using demo mode'
          }));
        }, 30000); // 30 second timeout

        requestQueue.push({
          prompt: fullPrompt,
          sessionId: newSessionId,
          resolve: ({ code, provider }) => {
            clearTimeout(timeout);
            
            // Update session
            if (session) {
              session.messages = [
                ...messages,
                { role: 'user', content: prompt },
                { role: 'assistant', content: code }
              ];
            }
            
            resolve(NextResponse.json({
              success: true,
              code,
              sessionId: newSessionId,
              provider,
              queuePosition: 0,
              poolStatus: apiPool.getStatus()
            }));
          },
          reject: (error) => {
            clearTimeout(timeout);
            resolve(NextResponse.json({
              success: false,
              error: error.message,
              poolStatus: apiPool.getStatus()
            }, { status: 500 }));
          },
          timestamp: Date.now()
        });

        // Start processing queue
        processQueue();
      });
    }

  } catch (error) {
    console.error('[API] Generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate code' },
      { status: 500 }
    );
  }
}

// GET endpoint to check pool status
export async function GET() {
  return NextResponse.json({
    poolStatus: apiPool.getStatus(),
    queueLength: requestQueue.length
  });
}
