import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const next = requestUrl.searchParams.get('next') || '/';

    // If there's no code, this isn't a valid auth callback
    if (!code) {
      console.error('No code provided in auth callback');
      return NextResponse.redirect(
        new URL('/auth/verification-error?error=no_code', request.url)
      );
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Exchange the code for a session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError);
      return NextResponse.redirect(
        new URL(`/auth/verification-error?error=${exchangeError.message}`, request.url)
      );
    }

    // Get the user data after successful code exchange
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Error getting user:', userError);
      return NextResponse.redirect(
        new URL('/auth/verification-error?error=user_not_found', request.url)
      );
    }

    // Check if the user's email is confirmed
    if (user.email_confirmed_at) {
      // Update user's email_verified status in the database
      await supabase
        .from('users')
        .update({ is_email_verified: true })
        .eq('id', user.id);

      // Email is verified, redirect to success page
      return NextResponse.redirect(
        new URL('/auth/verification-success', request.url)
      );
    } else {
      // Email not confirmed
      return NextResponse.redirect(
        new URL('/auth/verification-error?error=email_not_confirmed', request.url)
      );
    }
  } catch (error) {
    console.error('Unexpected error in auth callback:', error);
    return NextResponse.redirect(
      new URL('/auth/verification-error?error=unexpected', request.url)
    );
  }
} 