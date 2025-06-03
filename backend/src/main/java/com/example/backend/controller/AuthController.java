package com.example.backend.controller;

import com.example.backend.dto.request.ForgotPasswordRequest;
import com.example.backend.dto.request.LoginRequest;
import com.example.backend.dto.request.RegisterRequest;
import com.example.backend.dto.request.ResetPasswordRequest;
import com.example.backend.dto.request.ChangePasswordRequest;
import com.example.backend.dto.response.AuthResponse;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.AuthService;
import com.example.backend.utils.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "API để quản lý xác thực người dùng")
public class AuthController {

	private final AuthService authService;

	private final UserRepository userRepository;

	private final JwtUtil jwtUtil;

	private final PasswordEncoder passwordEncoder;

	@Operation(summary = "Đăng ký tài khoản mới",
			description = "API cho phép người dùng đăng ký tài khoản mới với thông tin username, password, email, và họ tên")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "201", description = "Đăng ký thành công",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = AuthResponse.class))),
			@ApiResponse(responseCode = "400", description = "Dữ liệu đầu vào không hợp lệ"),
			@ApiResponse(responseCode = "409", description = "Username hoặc email đã tồn tại")
	})
	@PostMapping("/register")
	public ResponseEntity<AuthResponse> register(
			@Parameter(description = "Thông tin đăng ký tài khoản", required = true)
			@RequestBody RegisterRequest request) {
		AuthResponse response = authService.register(request);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	@Operation(summary = "Đăng nhập",
			description = "API cho phép người dùng đăng nhập bằng username và password")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Đăng nhập thành công",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = AuthResponse.class))),
			@ApiResponse(responseCode = "401", description = "Thông tin đăng nhập không chính xác"),
			@ApiResponse(responseCode = "400", description = "Dữ liệu đầu vào không hợp lệ")
	})
	@PostMapping("/login")
	public ResponseEntity<AuthResponse> login(
			@Parameter(description = "Thông tin đăng nhập", required = true)
			@RequestBody LoginRequest request) {
		return ResponseEntity.ok(authService.login(request));
	}

	@Operation(summary = "Quên mật khẩu",
			description = "API cho phép người dùng yêu cầu khôi phục mật khẩu thông qua email")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Yêu cầu khôi phục mật khẩu thành công",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = AuthResponse.class))),
			@ApiResponse(responseCode = "400", description = "Thông tin không hợp lệ"),
			@ApiResponse(responseCode = "400", description = "Dữ liệu đầu vào không hợp lệ")
	})
	@PostMapping("/forgot-password")
	public ResponseEntity<AuthResponse> forgotPassword(
			@Parameter(description = "Thông tin yêu cầu khôi phục mật khẩu", required = true)
			@RequestBody ForgotPasswordRequest request){
		return ResponseEntity.ok(authService.forgotPassword(request));
	}

	@Operation(summary = "Đặt lại mật khẩu",
			description = "API cho phép người dùng đặt lại mật khẩu sau khi đã nhận được token")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Đặt lại mật khẩu thành công",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = AuthResponse.class))),
			@ApiResponse(responseCode = "400", description = "Dữ liệu đầu vào không hợp lệ"),
			@ApiResponse(responseCode = "401", description = "Token không hợp lệ hoặc đã hết hạn")
	})
	@PostMapping("/reset-password")
	public ResponseEntity<AuthResponse> resetPassword(
			@Parameter(description = "Thông tin đặt lại mật khẩu với token", required = true)
			@RequestBody ResetPasswordRequest request) {
		return ResponseEntity.ok(authService.resetPassword(request));
	}

	@Operation(summary = "Kiểm tra tính hợp lệ của token",
			description = "API cho phép kiểm tra xem token có hợp lệ hay không")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Kết quả kiểm tra token",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = Boolean.class))),
			@ApiResponse(responseCode = "400", description = "Dữ liệu đầu vào không hợp lệ")
	})
	@GetMapping("/validate")
	public ResponseEntity<Boolean> validateToken(
			@Parameter(description = "Token cần kiểm tra", required = true)
			@RequestParam String token) {
		return ResponseEntity.ok(authService.validateToken(token));
	}

	@PostMapping("/change-password")
	public ResponseEntity<?> changePassword(
			@RequestBody ChangePasswordRequest request,
			@RequestHeader("Authorization") String authHeader) {
		String token = jwtUtil.extractTokenFromHeader(authHeader);
		String userId = jwtUtil.extractUserId(token);

		User user = userRepository.findById(userId).orElseThrow();

		// Kiểm tra mật khẩu cũ
		if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Current password is incorrect");
		}

		// Đặt mật khẩu mới
		user.setPassword(passwordEncoder.encode(request.getNewPassword()));
		userRepository.save(user);

		return ResponseEntity.ok("Password changed successfully");
	}
}