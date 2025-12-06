# CORS Policy Fix

## Vấn đề hiện tại:
```
Access to fetch at 'http://localhost:9999/api/v1/identity/auth/token' from origin 'http://localhost:5173' has been blocked by CORS policy: The 'Access-Control-Allow-Origin' header contains multiple values 'http://localhost:5173, http://localhost:5173', but only one is allowed.
```

## Nguyên nhân:
Backend có **multiple CORS configurations** đang conflict:

1. **Identity Service** (`CoopConfig.java`): CORS filter
2. **API Gateway** (`WebClientConfiguration.java`): CORS web filter
3. **Security Configs**: Disable CORS trong SecurityConfig

## Giải pháp:

### Option 1: Fix Backend CORS (Recommended)
Cần disable CORS trong SecurityConfig và chỉ dùng một CORS configuration:

```java
// Trong SecurityConfig.java
.cors(c -> c.disable()); // Disable Spring Security CORS
```

Và chỉ dùng CORS filter trong `CoopConfig.java`.

### Option 2: Frontend Proxy (Quick Fix)
Thêm proxy trong `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:9999',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
```

### Option 3: Disable CORS trong Development
Thêm flag vào browser:
```
--disable-web-security --user-data-dir=/tmp/chrome_dev_test
```

## Recommended Solution:
1. **Backend**: Disable duplicate CORS configurations
2. **Frontend**: Use proxy for development
3. **Production**: Configure proper CORS headers
