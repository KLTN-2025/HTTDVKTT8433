# Quiz Service Status Check

## Vấn đề hiện tại:
- Frontend gọi `/api/v1/quiz/admin/quiz/subjects` → 404
- Quiz service chạy trên port 9192
- API Gateway chạy trên port 9999

## Debug Steps:

### 1. Kiểm tra Quiz Service trực tiếp:
```
GET http://localhost:9192/quiz/admin/quiz/subjects
POST http://localhost:9192/quiz/admin/quiz/subjects
```

### 2. Kiểm tra qua API Gateway:
```
GET http://localhost:9999/api/v1/quiz/admin/quiz/subjects
POST http://localhost:9999/api/v1/quiz/admin/quiz/subjects
```

### 3. Kiểm tra Authentication:
- Token có đúng format không?
- Role có đúng `ROLE_ADMIN` không?
- Authorization header có đúng không?

## Possible Issues:

### Issue 1: Quiz Service chưa deploy
- Quiz service có thể chưa start đúng
- Endpoints có thể chưa được register

### Issue 2: Authentication
- Token không hợp lệ
- Role không đúng
- Authorization header sai

### Issue 3: API Gateway routing
- Route configuration sai
- StripPrefix không đúng

## Test Commands:

### Test 1: Direct Quiz Service
```bash
curl -X GET "http://localhost:9192/quiz/admin/quiz/subjects" \
  -H "Authorization: Bearer <token>"
```

### Test 2: Via API Gateway  
```bash
curl -X GET "http://localhost:9999/api/v1/quiz/admin/quiz/subjects" \
  -H "Authorization: Bearer <token>"
```

### Test 3: Create Subject
```bash
curl -X POST "http://localhost:9999/api/v1/quiz/admin/quiz/subjects" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Hóa học"}'
```

## Next Steps:
1. Test trực tiếp quiz service
2. Kiểm tra authentication
3. Verify API Gateway routing
4. Check quiz service logs
