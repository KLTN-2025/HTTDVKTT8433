# Admin Account Unlock Guide

## Vấn đề hiện tại:
Admin account đã bị khóa với message: `The account has been locked! Contact Admin to handle: admin@gmail.com`

## Giải pháp:

### Option 1: Tạo Admin Account Khác (Recommended)
1. **Tạo user mới với role admin**:
   ```sql
   INSERT INTO users (id, username, email, password, role, is_blocked, created_at) 
   VALUES (
     'admin2-uuid', 
     'admin2', 
     'admin2@example.com', 
     '$2a$10$hashed_password', 
     'ADMIN', 
     false, 
     NOW()
   );
   ```

2. **Đăng nhập với admin2** và unlock admin chính

### Option 2: Reset Admin Account
1. **Unlock admin trong database**:
   ```sql
   UPDATE users 
   SET is_blocked = false 
   WHERE username = 'admin';
   ```

### Option 3: Emergency Unlock API
Tạo endpoint `/api/v1/admin/emergency-unlock` với emergency code.

## Cách thực hiện:

### Bước 1: Kiểm tra Database
```sql
SELECT id, username, email, is_blocked, role 
FROM users 
WHERE username = 'admin';
```

### Bước 2: Unlock Admin
```sql
UPDATE users 
SET is_blocked = false 
WHERE username = 'admin';
```

### Bước 3: Test Login
Thử đăng nhập lại với admin/admin

## Prevention:
- Thêm logic để prevent admin từ lock chính mình
- Tạo backup admin accounts
- Implement emergency unlock với proper authentication
