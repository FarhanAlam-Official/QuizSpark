import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const type = requestUrl.searchParams.get('type');

    // If there's no code, this isn't a valid auth callback
    if (!code) {
      console.error('No code provided in auth callback');
      return NextResponse.redirect(
        new URL('/auth/verification-error', request.url)
      );
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Exchange the code for a session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError);
      return NextResponse.redirect(
        new URL('/auth/verification-error', request.url)
      );
    }

    // Get the user data after successful code exchange
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Error getting user:', userError);
      return NextResponse.redirect(
        new URL('/auth/verification-error', request.url)
      );
    }

    // Handle different authentication scenarios
    if (type === 'recovery') {
      // Password reset flow
      return NextResponse.redirect(
        new URL('/auth/reset-password', request.url)
      );
    } else if (type === 'signup') {
      // Email verification flow
      if (user.email_confirmed_at) {
        // Email is verified, redirect to success page
        return NextResponse.redirect(
          new URL('/auth/verification-success', request.url)
        );
      } else {
        // Email not confirmed
        return NextResponse.redirect(
          new URL('/auth/verification-error', request.url)
        );
      }
    }

    // Default fallback for unknown types
    return NextResponse.redirect(
      new URL('/auth/verification-error', request.url)
    );

  } catch (error) {
    console.error('Unexpected error in auth callback:', error);
    return NextResponse.redirect(
      new URL('/auth/verification-error', request.url)
    );
  }
} 