import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Get the user data after successful verification
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user?.email_confirmed_at) {
        // Email is verified, redirect to success page with a message
        return NextResponse.redirect(
          new URL(`/auth/verification-success?next=${encodeURIComponent(next)}`, request.url)
        );
      }
    }
    
    // If there was an error or email is not confirmed
    return NextResponse.redirect(
      new URL('/auth/verification-error', request.url)
    );
  }

  // No code provided, redirect to home
  return NextResponse.redirect(new URL('/', request.url));
} 