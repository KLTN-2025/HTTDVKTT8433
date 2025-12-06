# Error Messages Test Guide

## Vấn đề đã fix:
- Backend trả về `{"code": 2002, "message": "Quiz already existed"}`
- Frontend không hiển thị message này cho user
- Cần hiển thị thông báo lỗi đẹp với emoji

## Error Handling Flow:

### 1. Backend Response:
```json
{
  "code": 2002,
  "message": "Quiz already existed"
}
```

### 2. Frontend Processing:
```typescript
// quizClient.ts
if (data.code && data.code !== 1000) {
  throw new Error(data.message || 'Tạo môn học thất bại')
}
```

### 3. UI Display:
```typescript
// AdminDashboard.tsx
const errorMessage = error?.message || 'Lỗi tạo môn học'
if (errorMessage.includes('already existed')) {
  setMsg({ text: `⚠️ ${errorMessage}`, type: 'error' })
} else {
  setMsg({ text: `❌ ${errorMessage}`, type: 'error' })
}
```

## Test Cases:

### Test 1: Tạo môn trùng tên
- **Action**: Click "🧪 Test Hóa học" lần 2
- **Expected**: `⚠️ Quiz already existed`

### Test 2: Tạo môn mới
- **Action**: Tạo môn "Toán học"
- **Expected**: `✅ Subject created successfully`

### Test 3: Lỗi khác
- **Action**: Tạo môn với tên rỗng
- **Expected**: `❌ Validation error`

## Error Message Types:

### Duplicate Error (⚠️):
- "Quiz already existed"
- "Subject already existed"
- "đã tồn tại"

### General Error (❌):
- "Validation error"
- "Server error"
- "Network error"

## UI Components:

### Success Message:
```jsx
<div className="bg-green-50 text-green-800 border border-green-200">
  ✅ Subject created successfully
</div>
```

### Warning Message:
```jsx
<div className="bg-yellow-50 text-yellow-800 border border-yellow-200">
  ⚠️ Quiz already existed
</div>
```

### Error Message:
```jsx
<div className="bg-red-50 text-red-800 border border-red-200">
  ❌ Validation error
</div>
```
