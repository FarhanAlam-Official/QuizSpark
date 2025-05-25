import { NextRequest, NextResponse } from 'next/server';
import { sendOTPEmail } from '@/lib/email/brevoService';

export async function GET(request: NextRequest) {
  try {
    // Get the test email from query parameter
    const { searchParams } = new URL(request.url);
    const testEmail = searchParams.get('email');
    
    if (!testEmail) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }

    console.log('🧪 Testing email service with:', {
      to: testEmail,
      timestamp: new Date().toISOString()
    });

    // Send a test OTP
    const testOTP = '123456';
    const result = await sendOTPEmail(testEmail, testOTP);

    return NextResponse.json({
      success: result.success,
      error: result.error,
      testOTP: testOTP // Only for testing purposes
    });
  } catch (error: any) {
    console.error('❌ Test email error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 