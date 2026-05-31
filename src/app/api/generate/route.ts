// Generate API - AI code generation endpoint
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

// In-memory session storage for demo mode
const sessions = new Map<string, { messages: Array<{role: string, content: string}> }>();

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

    // Get or create session (in-memory for demo)
    let session = sessionId ? sessions.get(sessionId) : null;
    const newSessionId = sessionId || `session_${Date.now()}`;
    
    if (!session) {
      session = { messages: [] };
      sessions.set(newSessionId, session);
    }

    // Build context from previous messages
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

    // Add existing code for modifications
    if (existingCode) {
      fullPrompt = `Existing code:\n\`\`\`html\n${existingCode}\n\`\`\`\n\nRequest: ${prompt}`;
    }

    // Add Figma data if provided
    if (figmaData) {
      fullPrompt = `Figma Design JSON:\n${figmaData}\n\nGenerate the website code that matches this design exactly. ${prompt}`;
    }

    // Check for API keys in environment
    const openrouterApiKey = process.env.OPENROUTER_API_KEY;
    const zaiApiKey = process.env.ZAI_API_KEY;
    const groqApiKey = process.env.GROQ_API_KEY;

    let generatedCode = '';
    let usedProvider = '';

    // Try OpenRouter FIRST (Primary - Laguna M.1 free model for coding)
    if (openrouterApiKey) {
      try {
        generatedCode = await callOpenRouter(openrouterApiKey, fullPrompt);
        usedProvider = 'OpenRouter';
      } catch (error) {
        console.error('OpenRouter failed:', error);
      }
    }

    // Try Z.AI if OpenRouter failed
    if (!generatedCode && zaiApiKey) {
      try {
        generatedCode = await callZAI(zaiApiKey, fullPrompt);
        usedProvider = 'Z.AI';
      } catch (error) {
        console.error('Z.AI failed:', error);
      }
    }

    // Try Groq if others failed
    if (!generatedCode && groqApiKey) {
      try {
        generatedCode = await callGroq(groqApiKey, fullPrompt);
        usedProvider = 'Groq';
      } catch (error) {
        console.error('Groq failed:', error);
      }
    }

    // Use demo mode if all APIs failed or no keys configured
    if (!generatedCode) {
      generatedCode = generateDemoCode(prompt);
      usedProvider = 'Demo';
    }

    // Extract code from response
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
      provider: usedProvider,
      demo: usedProvider === 'Demo'
    });

  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate code' },
      { status: 500 }
    );
  }
}

// Z.AI API call
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
  return data.choices[0].message.content;
}

// OpenRouter API call - Using free coding models
async function callOpenRouter(apiKey: string, prompt: string): Promise<string> {
  // List of verified free models from OpenRouter
  const freeModels = [
    'poolside/laguna-m.1:free',              // Laguna M.1 - excellent for coding
    'deepseek/deepseek-v4-flash:free',       // DeepSeek V4 Flash - fast and capable
    'qwen/qwen3-next-80b-a3b-instruct:free', // Qwen 3 Next 80B - powerful
    'google/gemma-4-31b-it:free',            // Gemma 4 31B - good for code
  ];

  let lastError: Error | null = null;

  for (const model of freeModels) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://sitezora-ai.vercel.app',
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
        console.error(`OpenRouter model ${model} error:`, response.status, errorData);
        lastError = new Error(`OpenRouter API error: ${response.status}`);
        continue; // Try next model
      }

      const data = await response.json();
      console.log(`OpenRouter success with model: ${model}`);
      return data.choices[0].message.content;
    } catch (error) {
      console.error(`OpenRouter model ${model} failed:`, error);
      lastError = error as Error;
    }
  }

  throw lastError || new Error('All OpenRouter models failed');
}

// Groq API call
async function callGroq(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 8192
    })
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Extract code from AI response
function extractCode(response: string): string {
  if (!response) return '';

  // Try to extract HTML code blocks first
  const htmlMatch = response.match(/```html\s*([\s\S]*?)```/);
  if (htmlMatch) {
    return htmlMatch[1].trim();
  }

  // Try to extract any code block
  const codeMatch = response.match(/```(?:\w+)?\s*([\s\S]*?)```/);
  if (codeMatch) {
    const code = codeMatch[1].trim();
    // Check if it looks like HTML
    if (code.includes('<!DOCTYPE') || code.includes('<html') || code.includes('<body')) {
      return code;
    }
  }

  // Handle unclosed code blocks (model might have stopped mid-generation)
  const unclosedMatch = response.match(/```html\s*([\s\S]*?)$/);
  if (unclosedMatch) {
    return unclosedMatch[1].trim();
  }

  // Check if the entire response looks like HTML
  if (response.includes('<!DOCTYPE') || response.includes('<html')) {
    // Remove any leading/trailing markdown
    let code = response.replace(/^```(?:html)?\s*/i, '').replace(/```\s*$/i, '');
    return code.trim();
  }

  return response.trim();
}

// Demo code generator for when no API keys are available
function generateDemoCode(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();
  
  // Detect type from prompt
  const isHero = lowerPrompt.includes('hero') || lowerPrompt.includes('headline');
  const isLanding = lowerPrompt.includes('landing') || lowerPrompt.includes('saas');
  const isPortfolio = lowerPrompt.includes('portfolio') || lowerPrompt.includes('personal');
  const isPricing = lowerPrompt.includes('pricing');
  const isBlog = lowerPrompt.includes('blog');
  
  if (isHero) {
    return generateHeroSection(prompt);
  } else if (isLanding) {
    return generateLandingPage(prompt);
  } else if (isPortfolio) {
    return generatePortfolioPage(prompt);
  } else if (isPricing) {
    return generatePricingPage(prompt);
  } else if (isBlog) {
    return generateBlogPage(prompt);
  }
  
  return generateDefaultPage(prompt);
}

function generateHeroSection(prompt: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hero Section</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white">
  <section class="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
    <div class="max-w-4xl mx-auto text-center">
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-6">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        Now Available
      </div>
      
      <h1 class="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
        Build Amazing Products
        <span class="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          10x Faster
        </span>
      </h1>
      
      <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        The modern platform for building beautiful, responsive websites with ease. 
        No coding required.
      </p>
      
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button class="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all">
          Get Started Free
          <span class="ml-2">→</span>
        </button>
        <button class="px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all">
          Watch Demo
        </button>
      </div>
      
      <div class="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          Free to start
        </div>
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          No credit card
        </div>
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          Cancel anytime
        </div>
      </div>
    </div>
  </section>
</body>
</html>`;
}

function generateLandingPage(prompt: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Modern Landing Page</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white">
  <!-- Navigation -->
  <nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600"></div>
          <span class="font-semibold text-lg text-gray-900">Brand</span>
        </div>
        <div class="hidden md:flex items-center gap-8">
          <a href="#features" class="text-gray-600 hover:text-gray-900">Features</a>
          <a href="#pricing" class="text-gray-600 hover:text-gray-900">Pricing</a>
          <a href="#about" class="text-gray-600 hover:text-gray-900">About</a>
          <button class="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">Get Started</button>
        </div>
      </div>
    </div>
  </nav>

  <!-- Hero Section -->
  <section class="pt-32 pb-20 px-4">
    <div class="max-w-4xl mx-auto text-center">
      <h1 class="text-5xl font-bold text-gray-900 mb-6">
        Build something amazing
        <span class="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">today</span>
      </h1>
      <p class="text-xl text-gray-600 mb-8">
        The modern platform for building beautiful, responsive websites with ease.
      </p>
      <div class="flex items-center justify-center gap-4">
        <button class="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
          Get Started Free
        </button>
        <button class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
          Learn More
        </button>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section id="features" class="py-20 bg-gray-50 px-4">
    <div class="max-w-7xl mx-auto">
      <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">Features</h2>
      <div class="grid md:grid-cols-3 gap-8">
        <div class="bg-white p-6 rounded-xl shadow-sm">
          <div class="w-12 h-12 bg-emerald-100 rounded-lg mb-4"></div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Lightning Fast</h3>
          <p class="text-gray-600">Optimized for speed and performance.</p>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm">
          <div class="w-12 h-12 bg-emerald-100 rounded-lg mb-4"></div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Fully Responsive</h3>
          <p class="text-gray-600">Looks great on all devices.</p>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm">
          <div class="w-12 h-12 bg-emerald-100 rounded-lg mb-4"></div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Easy to Use</h3>
          <p class="text-gray-600">Simple and intuitive interface.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="py-20 px-4">
    <div class="max-w-4xl mx-auto text-center">
      <h2 class="text-3xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
      <p class="text-gray-600 mb-8">Join thousands of users building with our platform.</p>
      <button class="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:opacity-90">
        Start Building Now
      </button>
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-gray-900 text-white py-12 px-4">
    <div class="max-w-7xl mx-auto text-center">
      <p class="text-gray-400">© 2024 Brand. All rights reserved.</p>
    </div>
  </footer>
</body>
</html>`;
}

function generatePortfolioPage(prompt: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portfolio</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white">
  <section class="min-h-screen flex items-center px-4">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-5xl font-bold text-gray-900 mb-4">John Doe</h1>
      <p class="text-xl text-gray-600 mb-8">Full Stack Developer & Designer</p>
      <div class="flex gap-4">
        <button class="px-6 py-3 bg-gray-900 text-white rounded-lg">View Work</button>
        <button class="px-6 py-3 border border-gray-300 rounded-lg">Contact</button>
      </div>
    </div>
  </section>
</body>
</html>`;
}

function generatePricingPage(prompt: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pricing</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white">
  <section class="py-20 px-4">
    <div class="max-w-5xl mx-auto">
      <h2 class="text-4xl font-bold text-center text-gray-900 mb-4">Simple Pricing</h2>
      <p class="text-center text-gray-600 mb-12">Choose the plan that works for you</p>
      
      <div class="grid md:grid-cols-3 gap-8">
        <div class="border border-gray-200 rounded-xl p-8">
          <h3 class="text-lg font-semibold text-gray-900">Free</h3>
          <p class="text-4xl font-bold text-gray-900 my-4">$0</p>
          <button class="w-full py-2 border border-gray-300 rounded-lg">Get Started</button>
        </div>
        
        <div class="border-2 border-emerald-500 rounded-xl p-8 relative">
          <span class="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-sm px-3 py-1 rounded-full">Popular</span>
          <h3 class="text-lg font-semibold text-gray-900">Pro</h3>
          <p class="text-4xl font-bold text-gray-900 my-4">$29</p>
          <button class="w-full py-2 bg-emerald-500 text-white rounded-lg">Get Started</button>
        </div>
        
        <div class="border border-gray-200 rounded-xl p-8">
          <h3 class="text-lg font-semibold text-gray-900">Enterprise</h3>
          <p class="text-4xl font-bold text-gray-900 my-4">$99</p>
          <button class="w-full py-2 border border-gray-300 rounded-lg">Contact Sales</button>
        </div>
      </div>
    </div>
  </section>
</body>
</html>`;
}

function generateBlogPage(prompt: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white">
  <section class="py-20 px-4">
    <div class="max-w-4xl mx-auto">
      <h2 class="text-4xl font-bold text-gray-900 mb-12">Latest Articles</h2>
      <div class="space-y-8">
        <article class="border-b border-gray-100 pb-8">
          <span class="text-emerald-600 text-sm font-medium">Technology</span>
          <h3 class="text-2xl font-bold text-gray-900 mt-2 mb-3">Getting Started with Modern Web Development</h3>
          <a href="#" class="text-emerald-600 font-medium">Read more →</a>
        </article>
      </div>
    </div>
  </section>
</body>
</html>`;
}

function generateDefaultPage(prompt: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Website</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white">
  <section class="min-h-screen flex items-center justify-center px-4">
    <div class="max-w-2xl mx-auto text-center">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Your Website</h1>
      <p class="text-xl text-gray-600 mb-8">Generated based on: "${prompt}"</p>
      <p class="text-gray-500">Add API keys in the admin panel to enable real AI generation.</p>
    </div>
  </section>
</body>
</html>`;
}
