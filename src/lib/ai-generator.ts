// AI Code Generation Utilities
import { apiPool, APIProvider } from './api-pool';
import { sessionManager } from './session-manager';

export interface GenerationOptions {
  sessionId: string;
  prompt: string;
  type: 'website' | 'component' | 'page' | 'modification';
  existingCode?: string;
  figmaData?: string;
  template?: string;
}

export interface GeneratedCode {
  html: string;
  css: string;
  js: string;
  fullCode: string;
}

// System prompts for different generation types
const SYSTEM_PROMPTS = {
  website: `You are an expert web developer specializing in creating modern, responsive websites. 
Generate clean, production-ready code using HTML, CSS (Tailwind CSS classes), and vanilla JavaScript.
Follow these rules:
1. Use Tailwind CSS classes for styling (assume Tailwind is available via CDN)
2. Make designs responsive (mobile-first approach)
3. Use semantic HTML5 elements
4. Add appropriate ARIA labels for accessibility
5. Include smooth animations and transitions
6. Ensure high contrast and readability
7. Use modern design patterns (glassmorphism, gradients, shadows where appropriate)
8. Return ONLY the code, no explanations needed
9. Wrap the entire code in a complete HTML document structure`,

  component: `You are an expert React developer. Generate a single React component using TypeScript and Tailwind CSS.
Follow these rules:
1. Use functional components with hooks
2. Include proper TypeScript types
3. Use Tailwind CSS for styling
4. Make components reusable and customizable via props
5. Return ONLY the component code`,

  modification: `You are an expert web developer. Modify the existing code based on the user's request.
Follow these rules:
1. Preserve the existing structure and functionality
2. Make only the requested changes
3. Maintain code quality and best practices
4. Return the complete modified code`,

  figma: `You are an expert web developer specializing in converting Figma designs to code.
Generate pixel-perfect code that matches the design exactly.
Follow these rules:
1. Use the exact colors, fonts, and spacing from the design
2. Use Tailwind CSS classes for styling
3. Make the design responsive
4. DO NOT generate any images - use placeholder divs or the provided assets
5. Return ONLY the code, no explanations needed`
};

// Generate website code
export async function generateWebsite(options: GenerationOptions): Promise<GeneratedCode> {
  const { sessionId, prompt, type, existingCode, figmaData } = options;

  let systemPrompt = SYSTEM_PROMPTS[type] || SYSTEM_PROMPTS.website;
  let fullPrompt = prompt;

  // Add existing code context if modifying
  if (existingCode && type === 'modification') {
    fullPrompt = `Existing code:\n\`\`\`html\n${existingCode}\n\`\`\`\n\nRequest: ${prompt}`;
  }

  // Add Figma data if provided
  if (figmaData) {
    systemPrompt = SYSTEM_PROMPTS.figma;
    fullPrompt = `Figma Design JSON:\n${figmaData}\n\nGenerate the website code that matches this design exactly. ${prompt}`;
  }

  // Build context from session
  const contextPrompt = sessionManager.buildContextPrompt(sessionId, fullPrompt);

  // Generate code using API pool
  const response = await apiPool.generateCode(contextPrompt, systemPrompt, sessionId);

  // Extract code from response
  const code = extractCode(response);

  // Update session
  await sessionManager.addMessage(sessionId, {
    role: 'user',
    content: prompt,
    timestamp: Date.now()
  });

  await sessionManager.addMessage(sessionId, {
    role: 'assistant',
    content: response,
    timestamp: Date.now()
  });

  await sessionManager.updateCodeState(sessionId, code.fullCode);

  return code;
}

// Extract code from AI response
function extractCode(response: string): GeneratedCode {
  // Try to extract code blocks
  const htmlMatch = response.match(/```html\n?([\s\S]*?)```/);
  const cssMatch = response.match(/```css\n?([\s\S]*?)```/);
  const jsMatch = response.match(/```javascript\n?([\s\S]*?)```/);
  const codeMatch = response.match(/```\n?([\s\S]*?)```/);

  let fullCode = '';

  if (htmlMatch) {
    fullCode = htmlMatch[1].trim();
  } else if (codeMatch) {
    fullCode = codeMatch[1].trim();
  } else {
    // Assume the entire response is code
    fullCode = response.trim();
  }

  // Extract separate parts if embedded
  let html = fullCode;
  let css = '';
  let js = '';

  // Extract style tags
  const styleMatch = fullCode.match(/<style[^>]*>([\s\S]*?)<\/style>/);
  if (styleMatch) {
    css = styleMatch[1].trim();
  }

  // Extract script tags
  const scriptMatch = fullCode.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  if (scriptMatch) {
    js = scriptMatch[1].trim();
  }

  return { html, css, js, fullCode };
}

// Validate generated code
export function validateCode(code: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for basic HTML structure
  if (!code.includes('<!DOCTYPE html>') && !code.includes('<html')) {
    errors.push('Missing HTML document structure');
  }

  // Check for unclosed tags (basic check)
  const openTags = code.match(/<([a-z]+)[^>]*>/gi) || [];
  const closeTags = code.match(/<\/([a-z]+)>/gi) || [];
  
  // Check for script injection attempts
  const dangerousPatterns = [
    /eval\s*\(/,
    /document\.write/,
    /<iframe[^>]+src\s*=\s*["']javascript:/,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(code)) {
      errors.push('Potentially dangerous code detected');
      break;
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Format code for display
export function formatCode(code: string): string {
  // Basic formatting - in production, use prettier
  return code
    .replace(/></g, '>\n<')
    .replace(/\{/g, '{\n')
    .replace(/\}/g, '\n}')
    .trim();
}

// Get suggested prompts
export function getSuggestedPrompts(): string[] {
  return [
    'Create a modern landing page for a SaaS product',
    'Build a portfolio website with a dark theme',
    'Design a pricing page with 3 tiers',
    'Create a contact form with validation',
    'Build a hero section with a gradient background',
    'Design a blog layout with card grid',
    'Create an about page with team section',
    'Build a testimonial slider',
    'Design a feature showcase section',
    'Create a newsletter signup component'
  ];
}
