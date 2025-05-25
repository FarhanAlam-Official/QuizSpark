import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasBrevoKey: !!process.env.BREVO_API_KEY,
    brevoKeyLength: process.env.BREVO_API_KEY?.length || 0,
    brevoSenderEmail: process.env.BREVO_SENDER_EMAIL,
    brevoSenderName: process.env.BREVO_SENDER_NAME,
    nodeEnv: process.env.NODE_ENV,
    // Don't include the actual API key in the response for security
  });
} 