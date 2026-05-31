import { db } from '../src/lib/db';

// API Keys should be loaded from environment variables
// DO NOT hardcode API keys in this file
// Set these in your .env file or Vercel environment variables:
// - GROQ_API_KEY
// - OPENROUTER_API_KEY
// - ZAI_API_KEY

async function main() {
  const keys = [
    { provider: 'groq', envKey: 'GROQ_API_KEY', name: 'Groq API Key' },
    { provider: 'openrouter', envKey: 'OPENROUTER_API_KEY', name: 'OpenRouter API Key' },
    { provider: 'zai', envKey: 'ZAI_API_KEY', name: 'Z.AI API Key' }
  ];

  for (const { provider, envKey, name } of keys) {
    const apiKey = process.env[envKey];
    
    if (!apiKey) {
      console.log(`Skipping ${provider}: ${envKey} not set in environment`);
      continue;
    }

    try {
      const encodedKey = Buffer.from(apiKey).toString('base64');
      
      const existing = await db.aPIKey.findFirst({
        where: { provider }
      });
      
      if (existing) {
        await db.aPIKey.update({
          where: { id: existing.id },
          data: { key: encodedKey, name, isActive: true }
        });
        console.log(`Updated ${provider} API key`);
      } else {
        await db.aPIKey.create({
          data: {
            provider,
            key: encodedKey,
            name,
            dailyLimit: 100,
            isActive: true
          }
        });
        console.log(`Added ${provider} API key`);
      }
    } catch (error) {
      console.error(`Error with ${provider}:`, error);
    }
  }
  
  const allKeys = await db.aPIKey.findMany();
  console.log('\n=== API keys in database ===');
  allKeys.forEach(k => console.log(`- ${k.name} (${k.provider}) - Active: ${k.isActive}`));
}

main().catch(console.error);
