// Admin API Keys Management - Updated
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { encryptApiKey } from '@/lib/api-pool';

// GET - List all API keys
export async function GET(request: NextRequest) {
  try {
    const keys = await db.aPIKey.findMany({
      select: {
        id: true,
        provider: true,
        name: true,
        isActive: true,
        dailyLimit: true,
        dailyUsed: true,
        lastUsed: true,
        requestCount: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, keys });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

// POST - Create new API key
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, key, name, dailyLimit } = body;

    if (!provider || !key) {
      return NextResponse.json(
        { success: false, error: 'Provider and key are required' },
        { status: 400 }
      );
    }

    // Validate provider
    if (!['zai', 'openrouter', 'groq'].includes(provider)) {
      return NextResponse.json(
        { success: false, error: 'Invalid provider. Use: zai, openrouter, or groq' },
        { status: 400 }
      );
    }

    // Encrypt the key
    const encryptedKey = encryptApiKey(key);

    const apiKey = await db.aPIKey.create({
      data: {
        provider,
        key: encryptedKey,
        name: name || `${provider.toUpperCase()} Key ${Date.now()}`,
        dailyLimit: dailyLimit || 100,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      key: {
        id: apiKey.id,
        provider: apiKey.provider,
        name: apiKey.name,
        isActive: apiKey.isActive,
        dailyLimit: apiKey.dailyLimit
      }
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}

// PUT - Update API key
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, isActive, dailyLimit } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Key ID is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (dailyLimit !== undefined) updateData.dailyLimit = dailyLimit;

    const apiKey = await db.aPIKey.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      key: {
        id: apiKey.id,
        provider: apiKey.provider,
        name: apiKey.name,
        isActive: apiKey.isActive,
        dailyLimit: apiKey.dailyLimit
      }
    });
  } catch (error) {
    console.error('Error updating API key:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update API key' },
      { status: 500 }
    );
  }
}

// DELETE - Delete API key
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Key ID is required' },
        { status: 400 }
      );
    }

    await db.aPIKey.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting API key:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete API key' },
      { status: 500 }
    );
  }
}
