import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const requestUrl = new URL(request.url);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        },
        emailRedirectTo: `${requestUrl.origin}/api/auth/callback`
      }
    });

    if (error) {
      console.error('Signup error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    // Check if email confirmation is required
    if (data.user && !data.session) {
      return NextResponse.json({
        success: true,
        message: 'Please check your email to confirm your account.',
        requiresEmailConfirmation: true
      });
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      session: data.session
    });
  } catch (error) {
    console.error('Signup API error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
