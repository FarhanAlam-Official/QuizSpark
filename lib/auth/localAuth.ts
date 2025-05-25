import axios from 'axios';
import { validateEmail, validatePassword } from '@/lib/utils/validation';

interface User {
  id: string;
  email: string;
  password: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  data: {
    user: Omit<User, 'password'> | null;
    session: { access_token: string } | null;
  } | null;
  error: { message: string } | null;
}

const API_URL = process.env.JSON_SERVER_URL || 'http://localhost:4000';

export async function signInWithLocalDb(email: string, password: string): Promise<AuthResponse> {
  console.log('🔐 Starting local sign in...', { email, timestamp: new Date().toISOString() });
  
  try {
    // Validate email
    console.log('✍️ Validating email...');
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      console.error('❌ Email validation failed:', emailValidation.error);
      throw new Error(emailValidation.error);
    }

    console.log('🔍 Fetching users from:', API_URL);
    const response = await axios.get(`${API_URL}/users`);
    console.log('📦 Users data received:', { count: response.data.length });
    
    const users: User[] = response.data;
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      console.error('❌ Invalid credentials for:', email);
      throw new Error('Invalid email or password');
    }
    
    console.log('✅ User authenticated successfully:', { email: user.email, role: user.role });
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      data: {
        user: userWithoutPassword,
        session: {
          access_token: 'local_session',
        },
      },
      error: null,
    };
  } catch (error: any) {
    console.error('❌ Sign in error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return {
      data: null,
      error: {
        message: error.message || 'An error occurred during sign in',
      },
    };
  }
}

export async function registerWithLocalDb(
  email: string,
  password: string,
  role: string = 'user'
): Promise<AuthResponse> {
  console.log('📝 Starting local registration...', { email, role, timestamp: new Date().toISOString() });
  
  try {
    // Validate email
    console.log('✍️ Validating email...');
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      console.error('❌ Email validation failed:', emailValidation.error);
      throw new Error(emailValidation.error);
    }

    // Validate password
    console.log('🔒 Validating password...');
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      console.error('❌ Password validation failed:', passwordValidation.errors);
      throw new Error(passwordValidation.errors[0]);
    }

    // Check for existing user
    console.log('🔍 Checking for existing user...');
    const response = await axios.get(`${API_URL}/users`);
    const users: User[] = response.data;
    
    if (users.some(u => u.email === email)) {
      console.error('❌ Email already exists:', email);
      throw new Error('An account with this email already exists');
    }

    // Create new user
    console.log('👤 Creating new user...');
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      password,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('💾 Saving user to database...');
    await axios.post(`${API_URL}/users`, newUser);

    console.log('✅ User registered successfully:', { email: newUser.email, role: newUser.role });
    const { password: _, ...userWithoutPassword } = newUser;

    return {
      data: {
        user: userWithoutPassword,
        session: {
          access_token: 'local_session',
        },
      },
      error: null,
    };
  } catch (error: any) {
    console.error('❌ Registration error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return {
      data: null,
      error: {
        message: error.message || 'An error occurred during registration',
      },
    };
  }
}

export async function checkEmailExists(email: string): Promise<boolean> {
  console.log('🔍 Checking if email exists...', { email, timestamp: new Date().toISOString() });
  try {
    const response = await axios.get(`${API_URL}/users`);
    const users: User[] = response.data;
    const exists = users.some(u => u.email === email);
    console.log('✅ Email check complete:', { email, exists });
    return exists;
  } catch (error: any) {
    console.error('❌ Error checking email:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return false;
  }
} 