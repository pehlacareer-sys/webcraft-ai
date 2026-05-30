// API Pool Manager - Manages multiple API keys for concurrent requests
import { db } from './db';

export type APIProvider = 'zai' | 'openrouter' | 'groq';

export interface APIKeyInfo {
  id: string;
  provider: APIProvider;
  key: string;
  name: string;
  inUse: boolean;
  requestCount: number;
  lastUsed: number;
}

interface QueueItem {
  prompt: string;
  systemPrompt: string;
  resolve: (value: string) => void;
  reject: (error: Error) => void;
  sessionId: string;
}

// Encryption utilities for API keys
export function encryptApiKey(text: string): string {
  // Simple base64 encoding for now - in production use proper encryption
  return Buffer.from(text).toString('base64');
}

export function decryptApiKey(encrypted: string): string {
  return Buffer.from(encrypted, 'base64').toString('utf-8');
}

class APIPoolManager {
  private queue: QueueItem[] = [];
  private processing: Map<string, boolean> = new Map();
  private readonly INACTIVITY_TIMEOUT = 22 * 60 * 1000; // 22 minutes

  // Get available API key from pool
  async getAvailableKey(provider?: APIProvider): Promise<APIKeyInfo | null> {
    const keys = await db.aPIKey.findMany({
      where: {
        isActive: true,
        OR: [
          { dailyUsed: { lt: db.aPIKey.fields.dailyLimit } },
          { lastReset: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
        ]
      },
      orderBy: {
        lastUsed: 'asc'
      }
    });

    // Reset daily usage if needed
    for (const key of keys) {
      const lastReset = key.lastReset.getTime();
      if (Date.now() - lastReset > 24 * 60 * 60 * 1000) {
        await db.aPIKey.update({
          where: { id: key.id },
          data: { dailyUsed: 0, lastReset: new Date() }
        });
      }
    }

    // Filter by provider if specified
    const filteredKeys = provider 
      ? keys.filter(k => k.provider === provider)
      : keys;

    // Find a key not currently in use
    for (const key of filteredKeys) {
      if (!this.processing.has(key.id)) {
        return {
          id: key.id,
          provider: key.provider as APIProvider,
          key: decryptApiKey(key.key),
          name: key.name,
          inUse: false,
          requestCount: key.requestCount,
          lastUsed: key.lastUsed?.getTime() || 0
        };
      }
    }

    return null;
  }

  // Lock API key to a session
  async lockKey(keyId: string, _sessionId: string): Promise<void> {
    this.processing.set(keyId, true);
    await db.aPIKey.update({
      where: { id: keyId },
      data: { lastUsed: new Date() }
    });
  }

  // Release API key from session
  async releaseKey(keyId: string): Promise<void> {
    this.processing.delete(keyId);
    
    // Increment request count
    await db.aPIKey.update({
      where: { id: keyId },
      data: {
        requestCount: { increment: 1 },
        dailyUsed: { increment: 1 }
      }
    });

    // Process queue
    this.processQueue();
  }

  // Add request to queue if no keys available
  addToQueue(item: QueueItem): void {
    this.queue.push(item);
  }

  // Process queued requests
  private async processQueue(): Promise<void> {
    if (this.queue.length === 0) return;

    const availableKey = await this.getAvailableKey();
    if (!availableKey) return;

    const item = this.queue.shift();
    if (!item) return;

    try {
      await this.lockKey(availableKey.id, item.sessionId);
      const result = await this.callAPI(availableKey, item.prompt, item.systemPrompt);
      item.resolve(result);
    } catch (error) {
      item.reject(error as Error);
    } finally {
      await this.releaseKey(availableKey.id);
    }
  }

  // Call API based on provider
  async callAPI(
    apiKey: APIKeyInfo, 
    prompt: string, 
    systemPrompt: string = 'You are an expert web developer.'
  ): Promise<string> {
    switch (apiKey.provider) {
      case 'zai':
        return this.callZAI(apiKey.key, prompt, systemPrompt);
      case 'openrouter':
        return this.callOpenRouter(apiKey.key, prompt, systemPrompt);
      case 'groq':
        return this.callGroq(apiKey.key, prompt, systemPrompt);
      default:
        throw new Error(`Unknown provider: ${apiKey.provider}`);
    }
  }

  // Z.AI API call
  private async callZAI(apiKey: string, prompt: string, systemPrompt: string): Promise<string> {
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
  private async callOpenRouter(apiKey: string, prompt: string, systemPrompt: string): Promise<string> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'AI Website Builder'
      },
      body: JSON.stringify({
        model: 'z-ai/glm-4.5-air:free',
        messages: [
          { role: 'system', content: systemPrompt },
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
  private async callGroq(apiKey: string, prompt: string, systemPrompt: string): Promise<string> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
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

  // Generate code with fallback
  async generateCode(
    prompt: string, 
    systemPrompt: string,
    sessionId: string,
    preferredProvider?: APIProvider
  ): Promise<string> {
    // Try preferred provider first
    if (preferredProvider) {
      const key = await this.getAvailableKey(preferredProvider);
      if (key) {
        try {
          await this.lockKey(key.id, sessionId);
          const result = await this.callAPI(key, prompt, systemPrompt);
          await this.releaseKey(key.id);
          return result;
        } catch (error) {
          await this.releaseKey(key.id);
          console.error(`${preferredProvider} failed, trying fallback:`, error);
        }
      }
    }

    // Try any available key
    const key = await this.getAvailableKey();
    if (key) {
      try {
        await this.lockKey(key.id, sessionId);
        const result = await this.callAPI(key, prompt, systemPrompt);
        await this.releaseKey(key.id);
        return result;
      } catch (error) {
        await this.releaseKey(key.id);
        throw error;
      }
    }

    // Add to queue if no keys available
    return new Promise((resolve, reject) => {
      this.addToQueue({ prompt, systemPrompt, resolve, reject, sessionId });
    });
  }

  // Get pool status
  async getPoolStatus(): Promise<{
    total: number;
    available: number;
    inUse: number;
    byProvider: Record<APIProvider, { total: number; available: number }>;
  }> {
    const keys = await db.aPIKey.findMany({
      where: { isActive: true }
    });

    const byProvider: Record<APIProvider, { total: number; available: number }> = {
      zai: { total: 0, available: 0 },
      openrouter: { total: 0, available: 0 },
      groq: { total: 0, available: 0 }
    };

    let available = 0;
    for (const key of keys) {
      const provider = key.provider as APIProvider;
      byProvider[provider].total++;
      if (!this.processing.has(key.id)) {
        byProvider[provider].available++;
        available++;
      }
    }

    return {
      total: keys.length,
      available,
      inUse: this.processing.size,
      byProvider
    };
  }
}

// Singleton instance
export const apiPool = new APIPoolManager();
