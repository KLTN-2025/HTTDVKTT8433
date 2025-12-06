# Delete User Debug Guide

## Vấn đề hiện tại:
- Delete user trả về "An error occurred while deleting user by admin"
- User vẫn còn trong danh sách sau khi delete
- Backend đã xóa user nhưng frontend vẫn hiển thị

## Nguyên nhân có thể:
1. **Admin-service gọi identity-service** qua Feign client có lỗi
2. **Profile service** không thể xóa profile
3. **Transaction rollback** do lỗi profile service
4. **Cache issue** - user vẫn còn trong cache

## Giải pháp đã thực hiện:

### 1. Gọi trực tiếp Identity Service
```typescript
// Thay vì gọi admin-service
const resp = await fetch(`${ADMIN_BASE_URL}/delete/${userId}`, ...)

// Gọi trực tiếp identity-service  
const resp = await fetch(`${IDENTITY_BASE_URL}/admin/delete/${userId}`, ...)
```

### 2. Xử lý Response Format
```typescript
// Identity-service trả về JSON
const data = await resp.json() as ApiResponse<void>
```

### 3. Error Handling
```typescript
if (data.code && data.code !== 200) {
  throw new Error(data.message || 'Xóa user thất bại')
}
```

## Test Steps:
1. **Test delete user** với user ID mới
2. **Kiểm tra console logs** để xem response
3. **Refresh user list** sau khi delete
4. **Kiểm tra database** trực tiếp

## Backend Endpoints:
- **Admin-service**: `DELETE /api/v1/admin/delete/{userId}` → gọi identity-service
- **Identity-service**: `DELETE /api/v1/identity/admin/delete/{userId}` → trực tiếp xóa

## Debug Commands:
```bash
# Kiểm tra user trong database
SELECT * FROM users WHERE id = 'user-id';

# Kiểm tra logs
tail -f admin-service.log
tail -f identity-service.log
```
