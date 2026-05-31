import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  if (code) {
    const supabase = await createClient();
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Auth callback error:', error);
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=${encodeURIComponent(error.message)}`
        );
      }
    } catch (error) {
      console.error('Failed to exchange code for session:', error);
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=Authentication failed`
      );
    }
  }

  // Redirect to dashboard or the specified next page
  return NextResponse.redirect(`${requestUrl.origin}${next}`);
}
