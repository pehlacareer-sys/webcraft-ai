// Session Manager - Handles session-based API locking
import { db } from './db';
import { apiPool, APIProvider } from './api-pool';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface SessionData {
  id: string;
  userId: string;
  projectId?: string;
  apiKeyId?: string;
  provider?: APIProvider;
  messages: Message[];
  codeState: string;
  lastActivity: Date;
  status: 'active' | 'expired' | 'archived';
}

class SessionManager {
  private sessions: Map<string, SessionData> = new Map();
  private readonly INACTIVITY_TIMEOUT = 22 * 60 * 1000; // 22 minutes
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start cleanup interval
    this.cleanupInterval = setInterval(() => this.cleanupExpiredSessions(), 60000);
  }

  // Create new session
  async createSession(userId: string, projectId?: string): Promise<SessionData> {
    const session = await db.session.create({
      data: {
        userId,
        projectId,
        messages: JSON.stringify([]),
        codeState: '',
        status: 'active'
      }
    });

    const sessionData: SessionData = {
      id: session.id,
      userId: session.userId,
      projectId: session.projectId || undefined,
      messages: [],
      codeState: '',
      lastActivity: new Date(),
      status: 'active'
    };

    this.sessions.set(session.id, sessionData);
    return sessionData;
  }

  // Get existing session
  async getSession(sessionId: string): Promise<SessionData | null> {
    // Check memory cache first
    const cached = this.sessions.get(sessionId);
    if (cached && cached.status === 'active') {
      return cached;
    }

    // Fetch from database
    const session = await db.session.findUnique({
      where: { id: sessionId }
    });

    if (!session || session.status !== 'active') {
      return null;
    }

    const sessionData: SessionData = {
      id: session.id,
      userId: session.userId,
      projectId: session.projectId || undefined,
      apiKeyId: session.apiKeyId || undefined,
      messages: JSON.parse(session.messages || '[]'),
      codeState: session.codeState || '',
      lastActivity: session.lastActivity,
      status: session.status as 'active' | 'expired' | 'archived'
    };

    this.sessions.set(sessionId, sessionData);
    return sessionData;
  }

  // Update session activity
  async updateActivity(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
    }

    await db.session.update({
      where: { id: sessionId },
      data: { lastActivity: new Date() }
    });
  }

  // Add message to session
  async addMessage(sessionId: string, message: Message): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.messages.push(message);
    session.lastActivity = new Date();

    await db.session.update({
      where: { id: sessionId },
      data: {
        messages: JSON.stringify(session.messages),
        lastActivity: new Date()
      }
    });
  }

  // Update code state
  async updateCodeState(sessionId: string, code: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.codeState = code;
    session.lastActivity = new Date();

    await db.session.update({
      where: { id: sessionId },
      data: {
        codeState: code,
        lastActivity: new Date()
      }
    });
  }

  // Get messages for context
  getMessages(sessionId: string): Message[] {
    const session = this.sessions.get(sessionId);
    return session?.messages || [];
  }

  // Build context prompt from messages
  buildContextPrompt(sessionId: string, newPrompt: string): string {
    const messages = this.getMessages(sessionId);
    
    if (messages.length === 0) {
      return newPrompt;
    }

    // Include last 10 messages for context
    const recentMessages = messages.slice(-10);
    let contextPrompt = 'Previous conversation context:\n\n';
    
    for (const msg of recentMessages) {
      if (msg.role === 'user') {
        contextPrompt += `User: ${msg.content}\n\n`;
      } else if (msg.role === 'assistant') {
        contextPrompt += `Assistant: ${msg.content.substring(0, 500)}...\n\n`;
      }
    }

    contextPrompt += `Current request: ${newPrompt}`;
    return contextPrompt;
  }

  // Lock API key to session
  async lockAPIToSession(sessionId: string, apiKeyId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.apiKeyId = apiKeyId;

    await db.session.update({
      where: { id: sessionId },
      data: { apiKeyId }
    });
  }

  // End session
  async endSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'expired';
    }

    await db.session.update({
      where: { id: sessionId },
      data: { status: 'expired' }
    });

    this.sessions.delete(sessionId);
  }

  // Archive session for potential resume
  async archiveSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.status = 'archived';

    await db.session.update({
      where: { id: sessionId },
      data: {
        status: 'archived',
        codeState: session.codeState,
        messages: JSON.stringify(session.messages)
      }
    });

    this.sessions.delete(sessionId);
  }

  // Cleanup expired sessions
  private async cleanupExpiredSessions(): Promise<void> {
    const now = Date.now();
    
    for (const [sessionId, session] of this.sessions) {
      const inactiveTime = now - session.lastActivity.getTime();
      
      if (inactiveTime >= this.INACTIVITY_TIMEOUT) {
        await this.archiveSession(sessionId);
      }
    }

    // Also cleanup in database
    await db.session.updateMany({
      where: {
        status: 'active',
        lastActivity: { lt: new Date(Date.now() - this.INACTIVITY_TIMEOUT) }
      },
      data: { status: 'expired' }
    });
  }

  // Get active sessions count
  getActiveSessionsCount(): number {
    return this.sessions.size;
  }

  // Destroy manager
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Singleton instance
export const sessionManager = new SessionManager();
