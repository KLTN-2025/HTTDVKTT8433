# Test Create Subject - Hóa học

## Endpoint:
```
POST http://localhost:9999/api/v1/quiz/admin/quiz/subjects
```

## Payload:
```json
{
  "name": "Hóa học"
}
```

## Headers:
```
Content-Type: application/json
Authorization: Bearer <admin_token>
```

## Expected Response:
```json
{
  "code": 1000,
  "message": "Subject created successfully",
  "result": "Hóa học"
}
```

## Test Steps:
1. **Login admin** và lấy token
2. **Gọi API** với payload trên
3. **Kiểm tra response** có success không
4. **Verify** môn học đã được tạo trong database

## Backend Implementation:
- **Controller**: `QuizAdminController.createSubject()`
- **Service**: `QuizAdminService.createSubject()`
- **Validation**: `@NotBlank` cho name field
- **Authorization**: `@PreAuthorize("hasRole('ADMIN')")`

## Frontend Integration:
- **Function**: `createSubject(request: CreateSubjectRequest)`
- **Type**: `CreateSubjectRequest = { name: string, description?: string }`
- **Usage**: `handleCreateSubject("Hóa học", "")`
