// Streaming Generate API - SSE endpoint with Plan Mode and Development Mode
import { NextRequest } from 'next/server';

// ============================================
// PROMPTS
// ============================================

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

const PLANNING_PROMPT = `You are an expert web architect and UI/UX designer. Your task is to analyze user requirements and create detailed, structured specifications for website development.

When given a user's prompt, create a comprehensive plan that includes:

## 1. PROJECT OVERVIEW
- Brief summary of what the website is about
- Target audience and purpose
- Key objectives

## 2. PAGE STRUCTURE
List all pages/sections needed:
- Homepage sections (hero, features, testimonials, CTA, footer)
- Additional pages if needed (about, contact, pricing, etc.)

## 3. COMPONENTS BREAKDOWN
For each section, specify:
- Navigation: logo, menu items, mobile menu, CTA button
- Hero: headline, subheadline, CTA buttons, background style
- Features: number of cards, icons, titles, descriptions
- Testimonials: number of cards, avatar, quote, name, role
- Footer: columns, links, social icons, newsletter

## 4. STYLING SPECIFICATIONS
- Color scheme: primary, secondary, accent, background, text colors
- Typography: font families, heading sizes, body text sizes
- Spacing: section padding, margins, gaps
- Visual style: modern, minimalist, playful, corporate, etc.

## 5. FEATURES & INTERACTIVITY
- Animations and transitions
- Hover effects
- Form functionality
- Interactive elements
- Responsive considerations

## 6. CONTENT GUIDELINES
- Key messages to convey
- Tone of voice (professional, friendly, casual)
- Call-to-action text suggestions

Be specific and detailed. Use green/emerald color palette as primary.
Return the plan in a structured markdown format.`;

const DEVELOPMENT_PROMPT = `You are an expert web developer. Based on the provided specification, generate complete, working HTML code.

CRITICAL RULES:
1. Return ONLY valid HTML code - no explanations, no markdown code fences
2. Always complete ALL code - never cut off mid-generation
3. Include: <!DOCTYPE html>, <html>, <head>, <body> tags
4. Use Tailwind CSS via: <script src="https://cdn.tailwindcss.com"></script>
5. Implement ALL sections and components specified in the plan
6. Use green/emerald colors for accents (not blue/purple)
7. Add smooth animations and hover effects
8. Make it fully responsive (mobile-first approach)
9. Close all HTML tags properly

IMPLEMENTATION GUIDELINES:
- Use semantic HTML5 elements
- Add proper ARIA labels for accessibility
- Include meta tags for SEO
- Add smooth scroll behavior
- Use CSS Grid and Flexbox for layouts
- Add gradient backgrounds where appropriate
- Include subtle animations with CSS transitions

Format: Start with <!DOCTYPE html> and end with </html>`;

// ============================================
// API POOL & PROVIDER MANAGEMENT
// ============================================

interface APIProvider {
  name: string;
  apiKey: string;
  inUse: boolean;
  requestCount: number;
  lastUsed: number;
}

// In-memory provider pool
const providers = new Map<string, APIProvider>();
let providersInitialized = false;

function initProviders() {
  if (providersInitialized) return;
  
  if (process.env.OPENROUTER_API_KEY) {
    providers.set('openrouter', {
      name: 'OpenRouter',
      apiKey: process.env.OPENROUTER_API_KEY,
      inUse: false,
      requestCount: 0,
      lastUsed: 0
    });
  }
  
  if (process.env.GROQ_API_KEY) {
    providers.set('groq', {
      name: 'Groq',
      apiKey: process.env.GROQ_API_KEY,
      inUse: false,
      requestCount: 0,
      lastUsed: 0
    });
  }

  if (process.env.ZAI_API_KEY) {
    providers.set('zai', {
      name: 'Z.AI',
      apiKey: process.env.ZAI_API_KEY,
      inUse: false,
      requestCount: 0,
      lastUsed: 0
    });
  }
  
  providersInitialized = true;
}

function getNextAvailableProvider(): APIProvider | null {
  initProviders();
  
  const priorityOrder = ['openrouter', 'groq', 'zai'];
  
  for (const providerId of priorityOrder) {
    const provider = providers.get(providerId);
    if (provider && !provider.inUse) {
      return provider;
    }
  }
  
  return null;
}

function lockProvider(providerId: string): boolean {
  const provider = providers.get(providerId);
  if (provider && !provider.inUse) {
    provider.inUse = true;
    provider.lastUsed = Date.now();
    return true;
  }
  return false;
}

function releaseProvider(providerId: string) {
  const provider = providers.get(providerId);
  if (provider) {
    provider.inUse = false;
    provider.requestCount++;
  }
}

// ============================================
// SSE HELPER FUNCTIONS
// ============================================

function createSSEEncoder() {
  const encoder = new TextEncoder();
  return {
    encode: (data: string) => encoder.encode(`data: ${data}\n\n`),
    encodeEvent: (event: string, data: string) => 
      encoder.encode(`event: ${event}\ndata: ${data}\n\n`)
  };
}

interface SSEMessage {
  type: 'status' | 'progress' | 'plan' | 'code' | 'error' | 'done' | 'provider';
  content: string;
  progress?: number;
  provider?: string;
}

function formatSSEMessage(message: SSEMessage): string {
  return JSON.stringify(message);
}

// ============================================
// STREAMING API CALLS
// ============================================

async function* streamOpenRouter(
  apiKey: string, 
  prompt: string, 
  systemPrompt: string,
  sendProgress: (progress: number, status: string) => void
): AsyncGenerator<string> {
  const models = [
    'poolside/laguna-m.1:free',
    'deepseek/deepseek-v4-flash:free',
    'qwen/qwen3-next-80b-a3b-instruct:free',
    'google/gemma-4-31b-it:free',
  ];

  let lastError: Error | null = null;

  for (const model of models) {
    try {
      sendProgress(10, `Trying OpenRouter model: ${model.split('/')[1]}`);
      
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
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 8192,
          stream: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`[OpenRouter] Model ${model} error:`, response.status, errorData);
        lastError = new Error(`OpenRouter error: ${response.status}`);
        continue;
      }

      sendProgress(20, `Connected to ${model.split('/')[1]}, generating...`);
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let fullContent = '';
      let chunkCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              if (content) {
                fullContent += content;
                chunkCount++;
                
                // Update progress based on chunks received
                if (chunkCount % 10 === 0) {
                  const progress = Math.min(90, 20 + (chunkCount / 2));
                  sendProgress(progress, `Generating... (${chunkCount} chunks)`);
                }
                
                yield content;
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      console.log(`[OpenRouter] Success with model: ${model}`);
      return;

    } catch (error) {
      console.error(`[OpenRouter] Model ${model} failed:`, error);
      lastError = error as Error;
    }
  }

  throw lastError || new Error('All OpenRouter models failed');
}

async function* streamGroq(
  apiKey: string, 
  prompt: string, 
  systemPrompt: string,
  sendProgress: (progress: number, status: string) => void
): AsyncGenerator<string> {
  const models = [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'llama3-8b-8192',
    'llama3-70b-8192'
  ];

  let lastError: Error | null = null;

  for (const model of models) {
    try {
      sendProgress(10, `Trying Groq model: ${model}`);
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 8192,
          stream: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`[Groq] Model ${model} error:`, response.status, errorData);
        lastError = new Error(`Groq error: ${response.status}`);
        continue;
      }

      sendProgress(20, `Connected to ${model}, generating...`);
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let fullContent = '';
      let chunkCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              if (content) {
                fullContent += content;
                chunkCount++;
                
                if (chunkCount % 10 === 0) {
                  const progress = Math.min(90, 20 + (chunkCount / 2));
                  sendProgress(progress, `Generating... (${chunkCount} chunks)`);
                }
                
                yield content;
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      console.log(`[Groq] Success with model: ${model}`);
      return;

    } catch (error) {
      console.error(`[Groq] Model ${model} failed:`, error);
      lastError = error as Error;
    }
  }

  throw lastError || new Error('All Groq models failed');
}

async function* streamZAI(
  apiKey: string, 
  prompt: string, 
  systemPrompt: string,
  sendProgress: (progress: number, status: string) => void
): AsyncGenerator<string> {
  sendProgress(10, 'Connecting to Z.AI...');
  
  const response = await fetch('https://api.z.ai/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'GLM-4.7-Flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 8192,
      stream: true
    })
  });

  if (!response.ok) {
    throw new Error(`Z.AI API error: ${response.status}`);
  }

  sendProgress(20, 'Connected to Z.AI, generating...');
  
  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let chunkCount = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content || '';
          if (content) {
            chunkCount++;
            
            if (chunkCount % 10 === 0) {
              const progress = Math.min(90, 20 + (chunkCount / 2));
              sendProgress(progress, `Generating... (${chunkCount} chunks)`);
            }
            
            yield content;
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }

  console.log('[Z.AI] Success');
}

// ============================================
// NON-STREAMING API CALLS (for Plan Mode)
// ============================================

async function callOpenRouterNonStreaming(
  apiKey: string, 
  prompt: string, 
  systemPrompt: string
): Promise<string> {
  const models = [
    'poolside/laguna-m.1:free',
    'deepseek/deepseek-v4-flash:free',
    'qwen/qwen3-next-80b-a3b-instruct:free',
    'google/gemma-4-31b-it:free',
  ];

  for (const model of models) {
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
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 4096
        })
      });

      if (!response.ok) continue;

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error(`[OpenRouter] Model ${model} failed:`, error);
    }
  }

  throw new Error('All OpenRouter models failed');
}

async function callGroqNonStreaming(
  apiKey: string, 
  prompt: string, 
  systemPrompt: string
): Promise<string> {
  const models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];

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
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 4096
        })
      });

      if (!response.ok) continue;

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error(`[Groq] Model ${model} failed:`, error);
    }
  }

  throw new Error('All Groq models failed');
}

async function callZAINonStreaming(
  apiKey: string, 
  prompt: string, 
  systemPrompt: string
): Promise<string> {
  const response = await fetch('https://api.z.ai/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'GLM-4.7-Flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4096
    })
  });

  if (!response.ok) {
    throw new Error(`Z.AI API error: ${response.status}`);
  }

  const data = await response.json();
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
// PLAN MODE GENERATION
// ============================================

async function generatePlan(
  prompt: string,
  sendProgress: (progress: number, status: string) => void
): Promise<string> {
  const provider = getNextAvailableProvider();
  
  if (!provider) {
    // Generate a basic plan if no providers available
    return generateBasicPlan(prompt);
  }

  const providerId = provider.name.toLowerCase();
  lockProvider(providerId);

  try {
    sendProgress(10, `Using ${provider.name} for planning...`);
    
    let plan = '';
    
    if (providerId === 'openrouter') {
      plan = await callOpenRouterNonStreaming(provider.apiKey, prompt, PLANNING_PROMPT);
    } else if (providerId === 'groq') {
      plan = await callGroqNonStreaming(provider.apiKey, prompt, PLANNING_PROMPT);
    } else if (providerId === 'zai') {
      plan = await callZAINonStreaming(provider.apiKey, prompt, PLANNING_PROMPT);
    }
    
    sendProgress(100, 'Plan generated successfully!');
    return plan;
    
  } catch (error) {
    console.error(`[Plan Mode] Error with ${provider.name}:`, error);
    sendProgress(50, 'Provider failed, generating basic plan...');
    return generateBasicPlan(prompt);
  } finally {
    releaseProvider(providerId);
  }
}

function generateBasicPlan(prompt: string): string {
  return `# Website Specification Plan

## 1. PROJECT OVERVIEW
Based on your request: "${prompt}"

**Purpose:** Create a professional, modern website that fulfills the user's requirements.
**Target Audience:** General users looking for the services/content described.
**Key Objectives:** Clear information presentation, user engagement, conversion optimization.

## 2. PAGE STRUCTURE

### Homepage Sections:
1. **Navigation Bar** - Logo, menu items, CTA button
2. **Hero Section** - Main headline, subheadline, call-to-action buttons
3. **Features Section** - 3-4 feature cards with icons
4. **About/Services Section** - Brief description of offerings
5. **Testimonials Section** - 2-3 customer testimonials
6. **Call-to-Action Section** - Final conversion prompt
7. **Footer** - Links, social media, copyright

## 3. COMPONENTS BREAKDOWN

### Navigation:
- Logo (left-aligned)
- Menu items: Home, Features, About, Contact
- CTA button: "Get Started"
- Mobile hamburger menu

### Hero:
- Large headline (bold, attention-grabbing)
- Supporting subheadline
- Two CTA buttons (primary + secondary)
- Background: gradient or subtle pattern

### Features:
- 3-4 cards in a grid layout
- Each card: icon, title, description
- Hover animations

### Testimonials:
- Cards with avatar, quote, name, role
- Carousel or grid layout

### Footer:
- 3-4 columns of links
- Social media icons
- Newsletter signup (optional)

## 4. STYLING SPECIFICATIONS

### Color Scheme:
- Primary: Emerald-600 (#059669)
- Secondary: Teal-600 (#0d9488)
- Accent: Emerald-400 (#34d399)
- Background: White, Gray-50
- Text: Gray-900, Gray-600

### Typography:
- Headings: Bold, 2xl-5xl
- Body: Regular, base-lg
- Font: System default or Inter

### Visual Style:
- Modern and clean
- Subtle shadows and rounded corners
- Smooth transitions and animations

## 5. FEATURES & INTERACTIVITY
- Smooth scroll navigation
- Hover effects on buttons and cards
- Fade-in animations on scroll
- Responsive mobile menu
- Form validation (if forms present)

## 6. CONTENT GUIDELINES
- Tone: Professional yet friendly
- Clear and concise messaging
- Strong calls-to-action
- Benefit-focused copy
`;
}

// ============================================
// MAIN STREAMING HANDLER
// ============================================

export async function POST(request: NextRequest) {
  const encoder = createSSEEncoder();
  
  try {
    const body = await request.json();
    const { 
      prompt, 
      mode = 'develop', // 'plan' or 'develop'
      plan, // Pre-generated plan for develop mode
      sessionId,
      existingCode 
    } = body;

    if (!prompt) {
      return new Response(
        encoder.encode(formatSSEMessage({
          type: 'error',
          content: 'Prompt is required'
        })),
        { 
          status: 400,
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
          }
        }
      );
    }

    const stream = new ReadableStream({
      async start(controller) {
        const sendProgress = (progress: number, status: string) => {
          controller.enqueue(encoder.encode(formatSSEMessage({
            type: 'progress',
            content: status,
            progress
          })));
        };

        const sendProvider = (providerName: string) => {
          controller.enqueue(encoder.encode(formatSSEMessage({
            type: 'provider',
            content: providerName,
            provider: providerName
          })));
        };

        try {
          // PLAN MODE
          if (mode === 'plan') {
            sendProgress(0, 'Starting plan generation...');
            sendProvider('Analyzing');
            
            const generatedPlan = await generatePlan(prompt, sendProgress);
            
            controller.enqueue(encoder.encode(formatSSEMessage({
              type: 'plan',
              content: generatedPlan
            })));
            
            controller.enqueue(encoder.encode(formatSSEMessage({
              type: 'done',
              content: 'Plan generation complete'
            })));
            
            controller.close();
            return;
          }

          // DEVELOP MODE
          sendProgress(0, 'Starting code generation...');
          
          // Build the full prompt
          let fullPrompt = prompt;
          
          if (plan) {
            // Use provided plan
            fullPrompt = `Specification/Plan:\n${plan}\n\nGenerate the complete HTML website based on this specification.`;
          } else {
            // Use prompt directly
            if (existingCode) {
              fullPrompt = `Existing code:\n\`\`\`html\n${existingCode}\n\`\`\`\n\nRequest: ${prompt}`;
            }
          }

          // Get available provider
          const provider = getNextAvailableProvider();
          
          if (!provider) {
            // No providers available - return demo
            sendProgress(50, 'No providers available, using demo mode...');
            
            const demoCode = generateDemoCode(prompt);
            controller.enqueue(encoder.encode(formatSSEMessage({
              type: 'code',
              content: demoCode
            })));
            
            controller.enqueue(encoder.encode(formatSSEMessage({
              type: 'done',
              content: 'Demo code generated'
            })));
            
            controller.close();
            return;
          }

          const providerId = provider.name.toLowerCase();
          lockProvider(providerId);
          sendProvider(provider.name);
          sendProgress(5, `Locked provider: ${provider.name}`);

          try {
            let fullContent = '';
            const systemPrompt = plan ? DEVELOPMENT_PROMPT : SYSTEM_PROMPT;

            const streamGenerator = 
              providerId === 'openrouter' ? streamOpenRouter :
              providerId === 'groq' ? streamGroq :
              streamZAI;

            for await (const chunk of streamGenerator(
              provider.apiKey, 
              fullPrompt, 
              systemPrompt,
              sendProgress
            )) {
              fullContent += chunk;
              controller.enqueue(encoder.encode(formatSSEMessage({
                type: 'code',
                content: chunk
              })));
            }

            sendProgress(95, 'Processing generated code...');
            
            // Extract clean code
            const cleanCode = extractCode(fullContent);
            
            sendProgress(100, 'Code generation complete!');
            
            controller.enqueue(encoder.encode(formatSSEMessage({
              type: 'done',
              content: 'Generation complete',
              provider: provider.name
            })));
            
          } finally {
            releaseProvider(providerId);
          }
          
          controller.close();
          
        } catch (error) {
          console.error('[Stream] Error:', error);
          controller.enqueue(encoder.encode(formatSSEMessage({
            type: 'error',
            content: error instanceof Error ? error.message : 'Generation failed'
          })));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no'
      }
    });

  } catch (error) {
    console.error('[API] Generation error:', error);
    
    return new Response(
      encoder.encode(formatSSEMessage({
        type: 'error',
        content: 'Failed to generate'
      })),
      { 
        status: 500,
        headers: {
          'Content-Type': 'text/event-stream'
        }
      }
    );
  }
}

// GET endpoint to check provider status
export async function GET() {
  initProviders();
  
  const status: Record<string, { available: boolean; requestCount: number }> = {};
  
  providers.forEach((provider, id) => {
    status[id] = {
      available: !provider.inUse,
      requestCount: provider.requestCount
    };
  });
  
  return Response.json({
    providers: status,
    totalProviders: providers.size,
    availableProviders: Array.from(providers.values()).filter(p => !p.inUse).length
  });
}

// Demo code generator fallback
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
      <button class="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 transition-all duration-300">
        Get Started
      </button>
    </div>
  </section>
</body>
</html>`;
}
