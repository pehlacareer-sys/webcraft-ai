import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { provider } = await request.json();

    if (!provider || !['google', 'github'].includes(provider)) {
      return NextResponse.json(
        { success: false, error: 'Invalid provider' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const requestUrl = new URL(request.url);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as 'google' | 'github',
      options: {
        redirectTo: `${requestUrl.origin}/api/auth/callback`
      }
    });

    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      url: data.url
    });
  } catch (error) {
    console.error('OAuth API error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
