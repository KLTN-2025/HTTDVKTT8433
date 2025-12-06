# Google OAuth Setup Guide

## 🔧 Cấu hình Google OAuth cho Frontend

### 1. Tạo Google OAuth Credentials

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Vào **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client IDs**
5. Chọn **Web application**
6. Cấu hình:
   - **Name**: Quiz App OAuth
   - **Authorized JavaScript origins**: 
     - `http://localhost:5173` (development)
     - `https://yourdomain.com` (production)
   - **Authorized redirect URIs**:
     - `http://localhost:5173` (development)
     - `https://yourdomain.com` (production)

### 2. Cấu hình Environment Variables

Tạo file `.env.local` trong thư mục `FE_QUIZ/spa/`:

```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# API Base URLs
VITE_IDENTITY_BASE_URL=/api/v1/identity
VITE_QUIZ_BASE_URL=/api/v1/quiz
VITE_ADMIN_BASE_URL=/api/v1/admin
VITE_AI_BASE_URL=/api/v1/Ai
VITE_PROFILE_BASE_URL=/api/v1/profile
VITE_NOTIFICATION_BASE_URL=/api/v1/notification
```

### 3. Cập nhật Google Config

Trong file `src/config/google.ts`, thay đổi:

```typescript
export const GOOGLE_CONFIG = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
  redirectUri: window.location.origin,
  scope: 'openid email profile'
}
```

### 4. Backend Configuration

Đảm bảo backend đã được cấu hình để xử lý Google OAuth:

- **Endpoint**: `POST /api/v1/identity/auth/google`
- **Request Body**: `{ "access_token": "google_jwt_token" }`
- **Response**: `{ "token": "your_jwt_token", "expiryTime": "..." }`

### 5. Testing Google OAuth

1. Start development server:
   ```bash
   npm run dev
   ```

2. Truy cập `http://localhost:5173/login`

3. Click nút **Google** để test

4. Kiểm tra console logs để debug

### 6. Production Deployment

1. Cập nhật **Authorized JavaScript origins** trong Google Console
2. Cập nhật **Authorized redirect URIs** trong Google Console
3. Deploy frontend với environment variables đúng
4. Test trên production domain

## 🔍 Troubleshooting

### Lỗi thường gặp:

1. **"Invalid client"**: Kiểm tra Client ID
2. **"Origin mismatch"**: Cập nhật Authorized JavaScript origins
3. **"Redirect URI mismatch"**: Cập nhật Authorized redirect URIs
4. **"CORS error"**: Kiểm tra backend CORS configuration

### Debug Steps:

1. Kiểm tra console logs
2. Kiểm tra Network tab trong DevTools
3. Kiểm tra Google Console logs
4. Kiểm tra backend logs

## 📚 Tài liệu tham khảo

- [Google Identity Services](https://developers.google.com/identity/gsi/web)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
