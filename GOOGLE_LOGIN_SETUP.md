# Google Login Setup Guide

## What's Been Implemented

✅ Frontend Google Login Button in Login page  
✅ Backend Google Login Endpoint (`/api/auth/google-login`)  
✅ User Model Updated with Google ID field  
✅ Google OAuth Library Installed (`@react-oauth/google`)

## Setup Steps

### 1. Get Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Search for "Google+ API" and enable it
4. Go to "Credentials" → Create "OAuth 2.0 ID"
5. Choose "Web application"
6. Add Authorized Redirect URIs:
   - `http://localhost:5173` (local development)
   - `http://localhost:3000` (if using different port)
   - Your production URL (e.g., `https://yourapp.com`)
7. Copy the **Client ID**

### 2. Update Environment Variables

**Frontend** (`.env` file):
```
VITE_GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
VITE_API_BASE_URL="https://maurmart.onrender.com"
```

**Backend** (`.env` file):
- No additional backend configuration needed for Google login
- Uses existing JWT_SECRET and database setup

### 3. Test the Integration

1. Start both Frontend and Backend
2. Go to Login page
3. You should see a "Sign in with Google" button
4. Click it and complete Google authentication
5. Should be redirected to home page after successful login

## Features

- **New User Registration**: If user doesn't exist, auto-creates account with Google data
- **Existing User Login**: Links Google account to existing email
- **Auto Verification**: Google email is automatically marked as verified
- **Profile Picture**: Stores Google profile picture URL
- **JWT Token**: Returns session token for API authentication

## API Endpoint

```
POST /api/auth/google-login
Body: {
  token: "Google JWT Token",
  name: "User Name",
  email: "user@example.com",
  picture: "https://..."
}

Response: {
  message: "Welcome back!",
  token: "JWT_TOKEN",
  user: { id, name, email, profilePic }
}
```

## Troubleshooting

**"Invalid Client ID" Error**
- Check that GOOGLE_CLIENT_ID is correctly set in `.env`
- Ensure Google Client ID is for Web application type
- Verify redirect URIs are added in Google Console

**"Popup blocked" / Cross-origin Issues**
- Make sure redirect URIs include your current domain
- Check browser console for CORS errors
- Verify Google Console shows correct authorized origins

**User not logging in**
- Check browser console for errors
- Verify backend is running and `/api/auth/google-login` is accessible
- Check backend logs for database errors

## Files Modified

1. **Frontend**:
   - `src/pages/Login.tsx` - Added Google login button
   - `src/App.tsx` - Added GoogleOAuthProvider wrapper
   - `.env` - Added VITE_GOOGLE_CLIENT_ID

2. **Backend**:
   - `controllers/auth.Controller.js` - Added googleLogin function
   - `routes/auth.Routes.js` - Added Google login route
   - `models/user.model.js` - Added googleId field

## Next Steps

1. Get your Google Client ID from Google Cloud Console
2. Update the `.env` file with your Client ID
3. Test the login flow
