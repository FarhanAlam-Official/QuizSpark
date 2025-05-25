const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

interface EmailResponse {
  success: boolean;
  error?: string;
}

export async function sendOTPEmail(email: string, otp: string): Promise<EmailResponse> {
  console.log('🔍 Starting email service...', { email, timestamp: new Date().toISOString() });
  
  // Get environment variables with fallback to Brevo's default sending domain
  const config = {
    apiKey: process.env.BREVO_API_KEY,
    senderEmail: process.env.BREVO_SENDER_EMAIL || 'noreply@quizspark.brevo.com', // Using Brevo's domain
    senderName: process.env.BREVO_SENDER_NAME || 'QuizSpark'
  };
  
  console.log('🔑 Environment Variables:', { 
    NODE_ENV: process.env.NODE_ENV,
    hasBrevoKey: !!config.apiKey,
    brevoKeyLength: config.apiKey?.length || 0,
    hasSenderEmail: !!config.senderEmail,
    hasSenderName: !!config.senderName,
    isServer: typeof window === 'undefined'
  });
  
  // Validate configuration
  if (!config.apiKey) {
    console.error('❌ BREVO_API_KEY is not configured');
    return { 
      success: false, 
      error: 'Email service is not configured properly. Please check server configuration.' 
    };
  }

  const emailData = {
    sender: {
      name: config.senderName,
      email: config.senderEmail
    },
    to: [{ email }],
    subject: "Your QuizSpark Verification Code",
    htmlContent: `
      <html>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #333; margin: 0;">QuizSpark</h1>
              <p style="color: #666; margin-top: 5px;">Email Verification</p>
            </div>
            
            <div style="margin-bottom: 30px;">
              <h2 style="color: #333; margin-bottom: 15px;">Verify Your Email</h2>
              <p style="color: #555; line-height: 1.5;">Hello,</p>
              <p style="color: #555; line-height: 1.5;">Your verification code for QuizSpark is:</p>
            </div>

            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 6px; margin: 20px 0;">
              <span style="font-size: 32px; letter-spacing: 5px; color: #2563eb; font-weight: bold;">${otp}</span>
            </div>

            <div style="margin-top: 30px; color: #666;">
              <p style="margin: 5px 0;">This code will expire in 10 minutes.</p>
              <p style="margin: 5px 0;">If you didn't request this code, please ignore this email.</p>
            </div>

            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #888;">
              <p style="margin: 5px 0;">Best regards,</p>
              <p style="margin: 5px 0; font-weight: bold;">QuizSpark Team</p>
            </div>
          </div>
        </body>
      </html>
    `,
    params: {
      OTP: otp,
      EXPIRY_MINUTES: "10"
    }
  };

  try {
    console.log('🚀 Attempting to send email...', { 
      to: email,
      sender: emailData.sender.email,
      timestamp: new Date().toISOString()
    });

    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': config.apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    const responseData = await response.json();
    console.log('📨 Email API Response:', { 
      status: response.status,
      statusText: response.statusText,
      data: responseData,
      timestamp: new Date().toISOString()
    });

    if (!response.ok) {
      console.error('❌ Email API Error:', responseData);
      throw new Error(responseData.message || 'Failed to send email');
    }

    console.log('✅ Email sent successfully!');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error sending email:', { 
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return { 
      success: false, 
      error: error.message || 'Failed to send verification email' 
    };
  }
} 