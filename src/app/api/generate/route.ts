// Generate API - AI code generation endpoint
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { apiPool } from '@/lib/api-pool';
import { encrypt } from '@/lib/api-pool';

const SYSTEM_PROMPT = `You are an expert web developer specializing in creating modern, responsive websites. 
Generate clean, production-ready code using HTML, CSS (Tailwind CSS classes), and vanilla JavaScript.
Follow these rules:
1. Use Tailwind CSS classes for styling (assume Tailwind is available via CDN)
2. Make designs responsive (mobile-first approach)
3. Use semantic HTML5 elements
4. Add appropriate ARIA labels for accessibility
5. Include smooth animations and transitions
6. Ensure high contrast and readability
7. Use modern design patterns (glassmorphism, gradients, shadows where appropriate)
8. Return ONLY the complete HTML code, no explanations needed
9. Wrap the entire code in a complete HTML document structure with DOCTYPE
10. Include Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>`;

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
    let session;
    if (sessionId) {
      session = await db.session.findUnique({ where: { id: sessionId } });
    }

    if (!session) {
      session = await db.session.create({
        data: {
          userId: 'guest',
          messages: JSON.stringify([]),
          codeState: '',
          status: 'active'
        }
      });
    }

    // Build context from previous messages
    let fullPrompt = prompt;
    const messages = JSON.parse(session.messages || '[]');
    
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

    // Get available API key
    const apiKeys = await db.aPIKey.findMany({
      where: { isActive: true }
    });

    if (apiKeys.length === 0) {
      // No API keys configured - use demo mode
      const demoCode = generateDemoCode(prompt);
      
      // Save message
      const updatedMessages = [...messages, 
        { role: 'user', content: prompt, timestamp: Date.now() },
        { role: 'assistant', content: demoCode, timestamp: Date.now() }
      ];
      
      await db.session.update({
        where: { id: session.id },
        data: {
          messages: JSON.stringify(updatedMessages),
          codeState: demoCode,
          lastActivity: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        code: demoCode,
        sessionId: session.id,
        demo: true,
        message: 'Demo mode - Add API keys in admin panel for real AI generation'
      });
    }

    // Try each API key until one works
    let generatedCode = '';
    let lastError = null;

    for (const apiKey of apiKeys) {
      try {
        const decryptedKey = decrypt(apiKey.key);
        
        if (apiKey.provider === 'zai') {
          generatedCode = await callZAI(decryptedKey, fullPrompt);
        } else if (apiKey.provider === 'openrouter') {
          generatedCode = await callOpenRouter(decryptedKey, fullPrompt);
        } else if (apiKey.provider === 'groq') {
          generatedCode = await callGroq(decryptedKey, fullPrompt);
        }

        // Update API key usage
        await db.aPIKey.update({
          where: { id: apiKey.id },
          data: {
            lastUsed: new Date(),
            requestCount: { increment: 1 },
            dailyUsed: { increment: 1 }
          }
        });

        break;
      } catch (error) {
        console.error(`API ${apiKey.provider} failed:`, error);
        lastError = error;
        continue;
      }
    }

    if (!generatedCode) {
      // All APIs failed - use demo mode
      generatedCode = generateDemoCode(prompt);
    }

    // Extract code from response
    const code = extractCode(generatedCode);

    // Save messages
    const updatedMessages = [...messages,
      { role: 'user', content: prompt, timestamp: Date.now() },
      { role: 'assistant', content: generatedCode, timestamp: Date.now() }
    ];

    await db.session.update({
      where: { id: session.id },
      data: {
        messages: JSON.stringify(updatedMessages),
        codeState: code,
        lastActivity: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      code,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate code' },
      { status: 500 }
    );
  }
}

// Decrypt helper
function decrypt(encrypted: string): string {
  return Buffer.from(encrypted, 'base64').toString('utf-8');
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

// OpenRouter API call
async function callOpenRouter(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'WebCraft AI'
    },
    body: JSON.stringify({
      model: 'z-ai/glm-4.5-air:free',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 8192
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
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
  // Try to extract code blocks
  const htmlMatch = response.match(/```html\n?([\s\S]*?)```/);
  const codeMatch = response.match(/```\n?([\s\S]*?)```/);

  if (htmlMatch) {
    return htmlMatch[1].trim();
  } else if (codeMatch) {
    return codeMatch[1].trim();
  }
  
  // Check if the entire response looks like HTML
  if (response.includes('<!DOCTYPE') || response.includes('<html')) {
    return response.trim();
  }
  
  return response.trim();
}

// Demo code generator for when no API keys are available
function generateDemoCode(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();
  
  // Detect type from prompt
  const isLanding = lowerPrompt.includes('landing') || lowerPrompt.includes('saas');
  const isPortfolio = lowerPrompt.includes('portfolio') || lowerPrompt.includes('personal');
  const isPricing = lowerPrompt.includes('pricing');
  const isBlog = lowerPrompt.includes('blog');
  
  if (isLanding) {
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
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600"></div>
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
        <span class="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">today</span>
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
          <div class="w-12 h-12 bg-violet-100 rounded-lg mb-4"></div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Lightning Fast</h3>
          <p class="text-gray-600">Optimized for speed and performance.</p>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm">
          <div class="w-12 h-12 bg-violet-100 rounded-lg mb-4"></div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Fully Responsive</h3>
          <p class="text-gray-600">Looks great on all devices.</p>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm">
          <div class="w-12 h-12 bg-violet-100 rounded-lg mb-4"></div>
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
      <button class="px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:opacity-90">
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
  <!-- Hero -->
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

  <!-- Projects -->
  <section class="py-20 bg-gray-50 px-4">
    <div class="max-w-7xl mx-auto">
      <h2 class="text-3xl font-bold text-gray-900 mb-12">Projects</h2>
      <div class="grid md:grid-cols-2 gap-8">
        <div class="bg-white rounded-xl overflow-hidden shadow-sm">
          <div class="h-48 bg-gradient-to-br from-violet-500 to-indigo-500"></div>
          <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-900">Project One</h3>
            <p class="text-gray-600">A modern web application</p>
          </div>
        </div>
        <div class="bg-white rounded-xl overflow-hidden shadow-sm">
          <div class="h-48 bg-gradient-to-br from-emerald-500 to-teal-500"></div>
          <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-900">Project Two</h3>
            <p class="text-gray-600">Mobile-first design system</p>
          </div>
        </div>
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
        <!-- Free -->
        <div class="border border-gray-200 rounded-xl p-8">
          <h3 class="text-lg font-semibold text-gray-900">Free</h3>
          <p class="text-4xl font-bold text-gray-900 my-4">$0</p>
          <p class="text-gray-600 mb-6">Perfect for getting started</p>
          <button class="w-full py-2 border border-gray-300 rounded-lg">Get Started</button>
        </div>
        
        <!-- Pro -->
        <div class="border-2 border-violet-500 rounded-xl p-8 relative">
          <span class="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-500 text-white text-sm px-3 py-1 rounded-full">Popular</span>
          <h3 class="text-lg font-semibold text-gray-900">Pro</h3>
          <p class="text-4xl font-bold text-gray-900 my-4">$29</p>
          <p class="text-gray-600 mb-6">Best for professionals</p>
          <button class="w-full py-2 bg-violet-500 text-white rounded-lg">Get Started</button>
        </div>
        
        <!-- Enterprise -->
        <div class="border border-gray-200 rounded-xl p-8">
          <h3 class="text-lg font-semibold text-gray-900">Enterprise</h3>
          <p class="text-4xl font-bold text-gray-900 my-4">$99</p>
          <p class="text-gray-600 mb-6">For large organizations</p>
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
          <span class="text-violet-600 text-sm font-medium">Technology</span>
          <h3 class="text-2xl font-bold text-gray-900 mt-2 mb-3">Getting Started with Modern Web Development</h3>
          <p class="text-gray-600 mb-4">Learn the fundamentals of building modern websites with the latest tools and technologies...</p>
          <a href="#" class="text-violet-600 font-medium">Read more →</a>
        </article>
        
        <article class="border-b border-gray-100 pb-8">
          <span class="text-emerald-600 text-sm font-medium">Design</span>
          <h3 class="text-2xl font-bold text-gray-900 mt-2 mb-3">Design Principles for Better User Experience</h3>
          <p class="text-gray-600 mb-4">Understanding the core principles that make websites more usable and engaging...</p>
          <a href="#" class="text-violet-600 font-medium">Read more →</a>
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
