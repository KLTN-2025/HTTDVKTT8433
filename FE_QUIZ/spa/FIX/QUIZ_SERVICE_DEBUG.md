# Quiz Service Debug Guide

## Vấn đề hiện tại:
- Quiz service endpoints trả về 404
- Frontend gọi `/api/v1/quiz/admin/quiz/subjects` → 404
- Backend trả về HTML thay vì JSON

## Cấu hình Services:

### Quiz Service:
- **Port**: 9192
- **Context Path**: `/quiz`
- **Full URL**: `http://localhost:9192/quiz`

### API Gateway:
- **Port**: 9999
- **Route**: `/api/v1/quiz/**` → `http://localhost:9192`
- **StripPrefix**: 2 (loại bỏ `/api/v1`)

## Endpoints có sẵn:

### QuizAdminController:
```java
@RestController
@RequestMapping("/admin/quiz")
public class QuizAdminController {
    @GetMapping("/subjects")
    @PreAuthorize("hasAnyRole('ROLE_TEACHER','ROLE_ADMIN','ROLE_SUTDENT','ROLE_USER')")
    public ApiResponse<List<SubjectResponse>> getAllSubjects()
    
    @PostMapping("/subjects")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> createSubject(@RequestBody @Valid CreateSubjectRequest request)
}
```

### QuizController:
```java
@RestController
@RequestMapping("/quizzes")
public class QuizController {
    @GetMapping("/subjects")
    @PreAuthorize("hasAnyRole('ROLE_TEACHER','ROLE_ADMIN','ROLE_SUTDENT','ROLE_USER')")
    public ApiResponse<List<SubjectResponse>> getAllSubjects()
}
```

## URLs đúng:

### Trực tiếp Quiz Service:
- `GET http://localhost:9192/quiz/quizzes/subjects`
- `POST http://localhost:9192/quiz/admin/quiz/subjects`

### Qua API Gateway:
- `GET http://localhost:9999/api/v1/quiz/quizzes/subjects`
- `POST http://localhost:9999/api/v1/quiz/admin/quiz/subjects`

## Fix cần thực hiện:

1. **Kiểm tra Quiz Service có chạy không**
2. **Sử dụng endpoint đúng** (`/quizzes/subjects` thay vì `/admin/quiz/subjects`)
3. **Thêm authentication headers**
4. **Test trực tiếp** trước khi qua gateway

## Test Commands:
```bash
# Test trực tiếp quiz service
curl -X GET "http://localhost:9192/quiz/quizzes/subjects"

# Test qua gateway
curl -X GET "http://localhost:9999/api/v1/quiz/quizzes/subjects"

# Test với auth
curl -X GET "http://localhost:9999/api/v1/quiz/quizzes/subjects" \
  -H "Authorization: Bearer <token>"
```
