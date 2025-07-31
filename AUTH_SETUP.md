# Authentication Setup Guide

This guide will help you set up the user authentication system for your Customer Intelligence Platform.

## 1. Database Setup

Run the migration to create the necessary tables:

```sql
-- Connect to your Supabase SQL Editor and run:
-- (The SQL is in supabase/migrations/001_create_auth_tables.sql)

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'cs_user' CHECK (role IN ('admin', 'cs_user')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_sign_in TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE
);

-- (Copy the rest from the migration file...)
```

## 2. Create Your Admin User

After running the migration, create your admin user in the Supabase Auth dashboard:

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user"
3. Enter your email and password
4. In the raw_user_meta_data field, add:
```json
{
  "full_name": "Your Name",
  "role": "admin"
}
```

## 3. Environment Variables

Ensure these environment variables are set:

```bash
# Already configured in your .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 4. User Roles & Permissions

### Admin Role (`admin`)
- Full access to all features
- User management capabilities
- Admin settings access
- All CRUD operations

### CS User Role (`cs_user`)
- ✅ **Apps** - Full access
- ✅ **Content Pipeline** - View only
- ✅ **Changelog** - View only  
- ✅ **Agents** - Create/manage their own agents
- ✅ **Competitors** - View only
- ✅ **Product Updates** - View only
- ✅ **AI Assistant** - Dashboard access
- ❌ **Meetings** - No access
- ❌ **Admin Settings** - No access

## 5. Testing the System

1. **Start the application:**
```bash
npm run dev
```

2. **Access the app:**
- Go to `http://localhost:3000`
- You should be redirected to `/login`

3. **Sign in with your admin account:**
- Use the email/password you created in Supabase
- You should be redirected to the dashboard

4. **Test navigation:**
- Admin users see all navigation items
- Navigation items are filtered based on permissions

## 6. Adding CS Team Members

1. **Via Supabase Dashboard (Current Method):**
   - Go to Authentication → Users → Add user
   - Set raw_user_meta_data:
   ```json
   {
     "full_name": "CS Team Member Name",
     "role": "cs_user"
   }
   ```

2. **Via User Management Page (Future Enhancement):**
   - Go to Admin Settings → User Management
   - Click "Invite User" (currently shows placeholder)

## 7. Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Route protection** via middleware
- **Component-level permission checking**
- **User-specific agent isolation**
- **Automatic profile creation** on signup

## 8. Troubleshooting

### "Profile Error" on login
- Check that the user profile was created properly
- Verify the trigger functions are working
- Check Supabase logs for errors

### Navigation items not showing
- Verify user role in user_profiles table
- Check PAGE_PERMISSIONS in `lib/auth.ts`
- Ensure RLS policies are correct

### Redirect loops
- Check middleware configuration
- Verify session handling in AuthContext
- Check for conflicting route guards

## Next Steps

1. **Test with CS team member account**
2. **Verify agent isolation works** (CS users only see their agents)
3. **Customize permissions** as needed in `lib/auth.ts`
4. **Add user invitation system** (future enhancement)
5. **Add audit logging** for user actions (future enhancement)

The authentication system is now ready for your internal team and CS team expansion!