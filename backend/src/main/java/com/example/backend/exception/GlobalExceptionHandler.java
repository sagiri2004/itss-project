package com.example.backend.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // Lấy profile từ application.properties (dev, prod, etc.)
    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    // Xử lý lỗi xác thực (AuthException)
    @ExceptionHandler(AuthException.class)
    public ResponseEntity<?> handleAuth(AuthException ex) {
        logger.warn("Authentication error: {}", ex.getMessage());
        return buildResponse(HttpStatus.UNAUTHORIZED, "Authentication failed: " + ex.getMessage());
    }

    // Xử lý lỗi không tìm thấy tài nguyên (ResourceNotFoundException)
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleNotFound(ResourceNotFoundException ex) {
        logger.warn("Resource not found: {}", ex.getMessage());
        return buildResponse(HttpStatus.NOT_FOUND, "Resource not found: " + ex.getMessage());
    }

    // Xử lý lỗi trạng thái không hợp lệ (InvalidStatusException)
    @ExceptionHandler(InvalidStatusException.class)
    public ResponseEntity<?> handleInvalidStatus(InvalidStatusException ex) {
        logger.warn("Invalid status: {}", ex.getMessage());
        return buildResponse(HttpStatus.BAD_REQUEST, "Invalid status: " + ex.getMessage());
    }

    // Xử lý lỗi validation (MethodArgumentNotValidException)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationExceptions(MethodArgumentNotValidException ex) {
        logger.warn("Validation error: {}", ex.getMessage());
        Map<String, Object> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        error -> error.getDefaultMessage() != null ? error.getDefaultMessage() : "Invalid value",
                        (existing, replacement) -> existing // Giữ lỗi đầu tiên nếu trùng field
                ));
        return buildResponse(HttpStatus.BAD_REQUEST, "Validation failed", errors);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<?> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex) {
        logger.warn("Method not supported: {}", ex.getMessage());
        String message = String.format("Request method '%s' is not supported for this endpoint", ex.getMethod());
        Map<String, Object> additionalInfo = new HashMap<>();
        if ("dev".equals(activeProfile)) {
            additionalInfo.put("debugInfo", ex.getMessage());
            additionalInfo.put("supportedMethods", ex.getSupportedMethods());
        }
        return buildResponse(HttpStatus.METHOD_NOT_ALLOWED, message, additionalInfo);
    }

    // Xử lý lỗi tham số không hợp lệ (IllegalArgumentException)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgument(IllegalArgumentException ex) {
        logger.warn("Illegal argument: {}", ex.getMessage());
        return buildResponse(HttpStatus.BAD_REQUEST, "Invalid input: " + ex.getMessage());
    }

    // Xử lý tất cả các lỗi khác (Exception)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleOther(Exception ex) {
        logger.error("Unexpected error: {}", ex.getMessage(), ex);
        String message = "An unexpected error occurred. Please try again later.";
        Map<String, Object> additionalInfo = new HashMap<>();
        // Chỉ thêm stack trace trong môi trường dev
        if ("dev".equals(activeProfile)) {
            additionalInfo.put("debugInfo", ex.getMessage());
            additionalInfo.put("stackTrace", getLimitedStackTrace(ex));
        }
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, message, additionalInfo);
    }

    // Hàm xây dựng response với thông điệp và dữ liệu bổ sung
    private ResponseEntity<?> buildResponse(HttpStatus status, String message) {
        return buildResponse(status, message, new HashMap<>());
    }

    private ResponseEntity<?> buildResponse(HttpStatus status, String message, Map<String, Object> additionalInfo) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        if (!additionalInfo.isEmpty()) {
            body.put("details", additionalInfo);
        }
        return new ResponseEntity<>(body, status);
    }

    // Giới hạn stack trace để tránh log quá dài
    private String getLimitedStackTrace(Exception ex) {
        StringBuilder sb = new StringBuilder();
        StackTraceElement[] stackTrace = ex.getStackTrace();
        int maxLines = Math.min(stackTrace.length, 5); // Giới hạn 5 dòng
        for (int i = 0; i < maxLines; i++) {
            sb.append(stackTrace[i].toString()).append("\n");
        }
        if (stackTrace.length > maxLines) {
            sb.append("... (truncated)");
        }
        return sb.toString();
    }
}