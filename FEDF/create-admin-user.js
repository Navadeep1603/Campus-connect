// Quick script to create admin user in Supabase
// Run this in your browser console on your app page

async function createAdminUser() {
  try {
    console.log('Creating admin user...')
    
    // First, try to sign up the admin user
    const { data, error } = await window.supabase.auth.signUp({
      email: 'admin@hub.com',
      password: 'admin123',
      options: {
        emailRedirectTo: undefined
      }
    })
    
    if (error) {
      console.error('Error creating admin user:', error)
      return
    }
    
    console.log('Admin user created:', data.user.id)
    
    // Now create the profile
    const { error: profileError } = await window.supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        college_id: 'ADMIN001',
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@hub.com',
        role: 'admin'
      })
    
    if (profileError) {
      console.error('Error creating admin profile:', profileError)
    } else {
      console.log('Admin profile created successfully!')
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

// Run the function
createAdminUser()
