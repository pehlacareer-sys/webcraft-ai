import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { success: false, user: null, isAuthenticated: false },
        { status: 200 }
      );
    }

    const isAdmin = user.user_metadata?.role === 'admin';

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        user_metadata: user.user_metadata
      },
      isAuthenticated: true,
      isAdmin
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
