# Google OAuth Configuration Fix

## Issues Fixed

1. **Client ID Configuration**: Updated frontend to use the correct Google Client ID from environment variables
2. **OAuth2 Flow**: Changed from Google Identity Services (GSI) to proper OAuth2 authorization code flow
3. **Redirect URIs**: Updated backend to redirect to frontend callback page
4. **Environment Variables**: Created `.env` file with proper Google Client ID

## Google Console Configuration Required

You need to update your Google Console OAuth2 configuration with these URIs:

### Authorized JavaScript origins
```
http://localhost:5173
```

### Authorized redirect URIs
```
http://localhost:5173/google-callback
http://localhost:9195/identity/login/oauth2/code/google
```

## Files Modified

1. **Frontend**:
   - `FE_QUIZ/spa/.env` - Added Google Client ID
   - `FE_QUIZ/spa/src/config/google.ts` - Updated redirect URI
   - `FE_QUIZ/spa/src/components/GoogleLoginButton.tsx` - Changed to OAuth2 flow
   - `FE_QUIZ/spa/src/pages/GoogleCallback.tsx` - New callback page
   - `FE_QUIZ/spa/src/App.tsx` - Added callback route

2. **Backend**:
   - `identity-service/src/main/java/com/LinkVerse/identity/configuration/OAuth2SuccessHandler.java` - New success handler
   - `identity-service/src/main/java/com/LinkVerse/identity/configuration/SecurityConfig.java` - Updated to use success handler
   - `identity-service/src/main/resources/application.yaml` - Added authorization-grant-type

## How It Works Now

1. User clicks "Google Login" button
2. Frontend redirects to `/api/v1/identity/oauth2/authorization/google`
3. Backend redirects to Google OAuth2 consent screen
4. User authorizes the application
5. Google redirects back to backend: `http://localhost:9195/identity/login/oauth2/code/google`
6. Backend processes the OAuth2 response and generates JWT token
7. Backend redirects to frontend: `http://localhost:5173/google-callback?token=...`
8. Frontend callback page saves token and redirects to admin dashboard

## Testing

1. Start the backend services
2. Start the frontend: `npm run dev`
3. Go to `http://localhost:5173/login`
4. Click "Google Login" button
5. Complete Google OAuth2 flow
6. Should redirect to admin dashboard

## Troubleshooting

If you still get "Client ID not found" error:
1. Check Google Console that the Client ID is correct
2. Verify the redirect URIs are exactly as listed above
3. Make sure the frontend is running on port 5173
4. Check browser console for any CORS errors
