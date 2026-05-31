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
      
      // Provide more helpful error messages
      let errorMessage = error.message;
      
      if (error.message.includes('not enabled') || error.message.includes('disabled')) {
        errorMessage = `${provider.charAt(0).toUpperCase() + provider.slice(1)} login is not enabled. Please contact your administrator to enable it in Supabase Dashboard → Authentication → Providers.`;
      } else if (error.message.includes('provider')) {
        errorMessage = `${provider.charAt(0).toUpperCase() + provider.slice(1)} OAuth is not configured. Please check your Supabase settings.`;
      } else if (error.message.includes('client_id') || error.message.includes('client secret')) {
        errorMessage = `${provider.charAt(0).toUpperCase() + provider.slice(1)} OAuth credentials are missing. Please add your Client ID and Secret in Supabase Dashboard.`;
      }
      
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    if (!data.url) {
      return NextResponse.json(
        { success: false, error: 'Failed to get OAuth URL. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: data.url
    });
  } catch (error) {
    console.error('OAuth API error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
