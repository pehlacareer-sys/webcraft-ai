// Admin Stats API
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get counts
    const [totalUsers, totalProjects, activeSessions, totalAPICalls] = await Promise.all([
      db.user.count(),
      db.project.count(),
      db.session.count({ where: { status: 'active' } }),
      db.aPIKey.aggregate({
        _sum: { requestCount: true }
      })
    ]);

    // Get API keys status
    const apiKeys = await db.aPIKey.findMany({
      select: {
        provider: true,
        isActive: true,
        requestCount: true,
        dailyUsed: true,
        dailyLimit: true
      }
    });

    const providerStats = {
      zai: { total: 0, active: 0, requests: 0 },
      openrouter: { total: 0, active: 0, requests: 0 },
      groq: { total: 0, active: 0, requests: 0 }
    };

    for (const key of apiKeys) {
      const provider = key.provider as keyof typeof providerStats;
      if (providerStats[provider]) {
        providerStats[provider].total++;
        if (key.isActive) providerStats[provider].active++;
        providerStats[provider].requests += key.requestCount;
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalProjects,
        activeSessions,
        totalAPICalls: totalAPICalls._sum.requestCount || 0,
        providerStats
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
