import { NextRequest, NextResponse } from 'next/server';
import { sendOTPEmail } from '@/lib/email/brevoService';

export async function POST(request: NextRequest) {
  try {
    console.log('📨 Starting send-otp API route...');
    
    const { email, otp } = await request.json();
    console.log('📧 Received request:', { email, hasOtp: !!otp });

    if (!email || !otp) {
      console.error('❌ Missing required fields:', { hasEmail: !!email, hasOtp: !!otp });
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    console.log('🔑 Environment check:', {
      hasBrevoKey: !!process.env.BREVO_API_KEY,
      brevoKeyLength: process.env.BREVO_API_KEY?.length || 0,
      hasSenderEmail: !!process.env.BREVO_SENDER_EMAIL,
      hasSenderName: !!process.env.BREVO_SENDER_NAME,
      nodeEnv: process.env.NODE_ENV
    });

    const result = await sendOTPEmail(email, otp);
    console.log('📬 Email service result:', result);

    if (!result.success) {
      console.error('❌ Email service failed:', result.error);
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }

    console.log('✅ Email sent successfully');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error in send-otp route:', {
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 