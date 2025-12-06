# Google OAuth Troubleshooting Guide

## 🔧 Fix lỗi Google OAuth

### ❌ **Lỗi thường gặp:**

#### 1. **"Not signed in with the identity provider"**
```
Not signed in with the identity provider.Understand this error
client:74 [GSI_LOGGER]: FedCM get() rejects with NetworkError: Error retrieving a token.
```

**Nguyên nhân:**
- Chưa cấu hình Google OAuth Client ID
- Chưa set environment variables
- Google OAuth chưa được enable

**Giải pháp:**
1. **Tạo Google OAuth Client ID:**
   - Vào [Google Cloud Console](https://console.cloud.google.com/)
   - APIs & Services > Credentials
   - Create Credentials > OAuth 2.0 Client IDs
   - Chọn "Web application"
   - Cấu hình Authorized JavaScript origins: `http://localhost:5173`

2. **Set Environment Variables:**
   ```env
   # Tạo file .env.local
   VITE_GOOGLE_CLIENT_ID=your_actual_client_id_here
   ```

3. **Enable Google+ API:**
   - APIs & Services > Library
   - Search "Google+ API"
   - Enable API

#### 2. **"Invalid client" Error**
**Nguyên nhân:** Client ID không đúng hoặc chưa được cấu hình

**Giải pháp:**
```typescript
// Kiểm tra trong src/config/google.ts
export const GOOGLE_CONFIG = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
  // Đảm bảo VITE_GOOGLE_CLIENT_ID được set đúng
}
```

#### 3. **"Origin mismatch" Error**
**Nguyên nhân:** Domain không được authorize trong Google Console

**Giải pháp:**
- Vào Google Cloud Console > Credentials
- Edit OAuth 2.0 Client ID
- Thêm vào **Authorized JavaScript origins**:
  - `http://localhost:5173` (development)
  - `https://yourdomain.com` (production)

#### 4. **"CORS error"**
**Nguyên nhân:** Backend chưa cấu hình CORS cho Google OAuth

**Giải pháp:**
```java
// Trong backend SecurityConfig
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOriginPatterns(Arrays.asList("*"));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

### 🔍 **Debug Steps:**

#### 1. **Kiểm tra Environment Variables:**
```bash
# Trong terminal
echo $VITE_GOOGLE_CLIENT_ID

# Hoặc trong browser console
console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID)
```

#### 2. **Kiểm tra Google Console:**
- Vào Google Cloud Console
- APIs & Services > Credentials
- Kiểm tra OAuth 2.0 Client ID
- Xem Authorized JavaScript origins

#### 3. **Kiểm tra Network Tab:**
- Mở DevTools > Network
- Click Google Login button
- Xem request đến Google API
- Kiểm tra response status

#### 4. **Kiểm tra Console Logs:**
```javascript
// Thêm vào GoogleLoginButton.tsx
console.log('Google Config:', GOOGLE_CONFIG)
console.log('Environment:', import.meta.env)
```

### 🚀 **Quick Fix:**

#### **Bước 1: Tạo Google OAuth Client ID**
1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Enable Google+ API
4. Tạo OAuth 2.0 Client ID
5. Cấu hình Authorized JavaScript origins

#### **Bước 2: Set Environment Variables**
```env
# Tạo file .env.local trong FE_QUIZ/spa/
VITE_GOOGLE_CLIENT_ID=your_actual_client_id_here
```

#### **Bước 3: Restart Development Server**
```bash
npm run dev
```

#### **Bước 4: Test Google Login**
1. Truy cập `http://localhost:5173/login`
2. Click Google button
3. Kiểm tra console logs
4. Kiểm tra Network tab

### 📚 **Tài liệu tham khảo:**

- [Google Identity Services](https://developers.google.com/identity/gsi/web)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

### 🆘 **Nếu vẫn lỗi:**

1. **Kiểm tra Google Console logs**
2. **Kiểm tra browser console**
3. **Kiểm tra network requests**
4. **Kiểm tra backend logs**
5. **Thử với incognito mode**

### 💡 **Tips:**

- **Development**: Sử dụng `http://localhost:5173`
- **Production**: Sử dụng domain thực tế
- **Testing**: Sử dụng incognito mode
- **Debug**: Bật console logs
