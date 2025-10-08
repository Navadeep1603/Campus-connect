# Supabase Setup Guide for Campus Connect

## Prerequisites
- A Supabase account (free tier available at https://supabase.com)
- Your Campus Connect project

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign up/sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `campus-connect`
   - Database Password: (choose a strong password)
   - Region: Choose the closest to your users
5. Click "Create new project"
6. Wait for the project to be set up (usually takes 1-2 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - **Project URL** (something like `https://your-project-id.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 3: Set Up Environment Variables

1. In your project root, create a `.env` file:
   ```bash
   # Copy .env.example to .env
   cp .env.example .env
   ```

2. Edit the `.env` file and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the entire content from `database-schema.sql` in your project root
3. Paste it into the SQL Editor and click "Run"
4. This will create all necessary tables, policies, and sample data

## Step 5: Configure Authentication

1. In Supabase dashboard, go to Authentication > Settings
2. Under "Site URL", add your local development URL: `http://localhost:5173`
3. Under "Redirect URLs", add: `http://localhost:5173/**`
4. Save the settings

## Step 6: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:5173`

3. Try to register a new user or use the default admin credentials:
   - Email: `admin@hub.com`
   - Password: `admin123`

## Step 7: Production Deployment

When deploying to production:

1. Update your Supabase authentication settings:
   - Add your production domain to "Site URL"
   - Add your production domain to "Redirect URLs"

2. Set environment variables in your hosting platform:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Features Enabled

With Supabase integration, your app now has:

- ✅ **Real-time database** - Changes sync across users instantly
- ✅ **User authentication** - Secure login/signup with email verification
- ✅ **Row Level Security** - Data access controlled by user roles
- ✅ **Scalable backend** - Handles thousands of users
- ✅ **API auto-generation** - REST and GraphQL APIs
- ✅ **File storage** - For future features like profile pictures
- ✅ **Real-time subscriptions** - Live updates for events and notifications

## Troubleshooting

### Common Issues:

1. **"Missing Supabase environment variables"**
   - Make sure your `.env` file exists and has the correct variable names
   - Restart your development server after adding environment variables

2. **"Invalid API key"**
   - Double-check your anon key from Supabase dashboard
   - Make sure there are no extra spaces or characters

3. **Database connection errors**
   - Ensure you've run the database schema SQL
   - Check that your project URL is correct

4. **Authentication not working**
   - Verify your Site URL and Redirect URLs in Supabase Auth settings
   - Make sure you're using the correct email/password format

### Getting Help

- Check the Supabase documentation: https://supabase.com/docs
- Join the Supabase Discord: https://discord.supabase.com
- Review the Campus Connect code for implementation details

## Next Steps

Consider adding these features:
- Email verification for new users
- Password reset functionality
- Real-time notifications
- File upload for event images
- Advanced user roles and permissions
