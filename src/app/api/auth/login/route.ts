import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Login error:', error);
      
      // Provide user-friendly error messages
      let errorMessage = error.message;
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please verify your email address before signing in.';
      }
      
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      session: data.session
    });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
