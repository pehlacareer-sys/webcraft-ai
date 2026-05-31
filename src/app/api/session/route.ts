// Session API - Create and manage sessions
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, projectId } = body;

    // Create session in database
    const session = await db.session.create({
      data: {
        userId: userId || 'guest',
        projectId: projectId || null,
        messages: JSON.stringify([]),
        codeState: '',
        status: 'active'
      }
    });

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        userId: session.userId,
        projectId: session.projectId,
        status: session.status,
        createdAt: session.createdAt
      }
    });
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID required' },
        { status: 400 }
      );
    }

    const session = await db.session.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        userId: session.userId,
        projectId: session.projectId,
        messages: JSON.parse(session.messages || '[]'),
        codeState: session.codeState,
        status: session.status,
        lastActivity: session.lastActivity
      }
    });
  } catch (error) {
    console.error('Session fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID required' },
        { status: 400 }
      );
    }

    await db.session.update({
      where: { id: sessionId },
      data: { status: 'expired' }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Session deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}
