// Test Supabase connection and create tables if needed
import { supabase } from './src/lib/supabase.js'

async function testSupabaseConnection() {
  try {
    console.log('🔗 Testing Supabase connection...')
    
    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    
    if (error) {
      console.error('❌ Connection error:', error.message)
      
      if (error.message.includes('relation "public.profiles" does not exist')) {
        console.log('📋 Creating profiles table...')
        await createProfilesTable()
      }
    } else {
      console.log('✅ Supabase connection successful!')
      console.log('📊 Profiles table exists')
    }
    
    // Test creating a user
    console.log('👤 Testing user creation...')
    await testUserCreation()
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

async function createProfilesTable() {
  const { error } = await supabase.rpc('create_profiles_table', {})
  
  if (error) {
    console.error('❌ Failed to create profiles table:', error)
    console.log('📝 Please run this SQL in your Supabase SQL Editor:')
    console.log(`
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  college_id TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can create a profile" ON public.profiles
  FOR INSERT WITH CHECK (true);
    `)
  } else {
    console.log('✅ Profiles table created successfully!')
  }
}

async function testUserCreation() {
  try {
    // Try to create a test user
    const { data, error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpass123',
      options: {
        data: {
          college_id: 'TEST001',
          first_name: 'Test',
          last_name: 'User',
          role: 'student'
        }
      }
    })
    
    if (error) {
      console.error('❌ User creation failed:', error.message)
    } else {
      console.log('✅ User creation test successful!')
      console.log('User ID:', data.user?.id)
    }
  } catch (error) {
    console.error('💥 User creation test failed:', error)
  }
}

// Run the test
testSupabaseConnection()
