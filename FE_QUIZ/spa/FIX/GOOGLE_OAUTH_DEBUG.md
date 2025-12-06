# Google OAuth Debug Guide

## Vấn đề hiện tại
Google OAuth2 callback thành công nhưng frontend không chuyển đến trang quiz.

## Các bước debug

### 1. Kiểm tra Console Logs
Mở Developer Tools (F12) và xem console logs:

**Khi click "Google Login":**
```
🔍 Redirecting to Google OAuth2: /api/v1/identity/oauth2/authorization/google
```

**Khi Google redirect về:**
```
🔍 GoogleCallback: Starting callback handling...
🔍 Current URL: http://localhost:5173/google-callback?token=...
🔍 Search params: ?token=...
🔍 Token from URL: eyJhbGciOiJIUzUxMiJ9...
✅ Google OAuth2 callback successful, token received: eyJhbGciOiJIUzUxMiJ9...
💾 Token saved to localStorage
🔄 Redirecting to quiz homepage...
```

**Khi vào QuizHome:**
```
🔍 QuizHome: Checking authentication...
🔍 QuizHome: Token exists: true
✅ QuizHome: Token found, showing homepage
```

### 2. Kiểm tra URL
- **Login page**: `http://localhost:5173/login`
- **Google OAuth**: `http://localhost:9195/identity/oauth2/authorization/google`
- **Callback**: `http://localhost:5173/google-callback?token=...`
- **Quiz Home**: `http://localhost:5173/quiz`

### 3. Kiểm tra localStorage
Trong Developer Tools > Application > Local Storage:
- Key: `access_token`
- Value: JWT token (bắt đầu với `eyJ...`)

### 4. Các lỗi có thể gặp

#### Lỗi 1: "Could not establish connection"
- **Nguyên nhân**: Extension conflict
- **Giải pháp**: Tắt các extension không cần thiết

#### Lỗi 2: "Token not found"
- **Nguyên nhân**: Backend không trả về token
- **Giải pháp**: Kiểm tra backend logs

#### Lỗi 3: "Redirect loop"
- **Nguyên nhân**: QuizHome redirect về login
- **Giải pháp**: Kiểm tra token trong localStorage

### 5. Test thủ công

1. **Test Google OAuth flow:**
   ```
   http://localhost:5173/api/v1/identity/oauth2/authorization/google
   ```

2. **Test callback với token giả:**
   ```
   http://localhost:5173/google-callback?token=test-token
   ```

3. **Test quiz homepage:**
   ```
   http://localhost:5173/quiz
   ```

### 6. Debug Commands

**Kiểm tra token trong localStorage:**
```javascript
console.log('Token:', localStorage.getItem('access_token'))
```

**Kiểm tra URL params:**
```javascript
console.log('URL:', window.location.href)
console.log('Search:', window.location.search)
```

**Test redirect:**
```javascript
navigate('/quiz')
```

## Kết quả mong đợi

1. Click "Google Login" → Redirect đến Google
2. Google OAuth → Redirect về `/google-callback?token=...`
3. GoogleCallback → Lưu token → Redirect đến `/quiz`
4. QuizHome → Hiển thị trang chủ quiz

## Nếu vẫn không hoạt động

1. **Clear browser cache**
2. **Restart backend services**
3. **Check network tab** trong DevTools
4. **Verify Google Console settings**
