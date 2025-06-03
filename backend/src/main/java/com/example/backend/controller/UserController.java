package com.example.backend.controller;

import com.example.backend.dto.request.EmailRequest;
import com.example.backend.event.NotificationEvent;
import com.example.backend.kafka.NotificationEventProducer;
import com.example.backend.service.EmailService;
import com.example.backend.dto.response.UserResponse;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.example.backend.utils.JwtUtil;

@Slf4j
@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "User Management", description = "API quản lý người dùng và gửi thông báo")
public class UserController {

	@Autowired
	private EmailService emailService;

	@Autowired
	private NotificationEventProducer notificationEventProducer;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private JwtUtil jwtUtil;

	@Operation(summary = "Truy cập vào trang người dùng",
			description = "API chỉ cho phép người dùng đã xác thực với vai trò USER hoặc ADMIN truy cập",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Truy cập thành công",
					content = @Content(mediaType = "text/plain",
							schema = @Schema(type = "string"))),
			@ApiResponse(responseCode = "403", description = "Không có quyền truy cập")
	})
	@GetMapping
	@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
	public String userAccess() {
		return "Welcome, User!";
	}

	@Operation(summary = "Truy cập vào trang admin",
			description = "API chỉ cho phép người dùng đã xác thực với vai trò ADMIN truy cập",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Truy cập thành công",
					content = @Content(mediaType = "text/plain",
							schema = @Schema(type = "string"))),
			@ApiResponse(responseCode = "403", description = "Không có quyền truy cập")
	})
	@GetMapping("/admin")
	@PreAuthorize("hasAuthority('ADMIN')")
	public String adminAccess() {
		return "Welcome, Admin!";
	}

	@Operation(summary = "Gửi email",
			description = "API cho phép gửi email đến người dùng")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Email đang được gửi",
					content = @Content(mediaType = "text/plain",
							schema = @Schema(type = "string"))),
			@ApiResponse(responseCode = "400", description = "Dữ liệu đầu vào không hợp lệ")
	})
	@PostMapping("/send")
	public String sendEmail(
			@Parameter(description = "Thông tin email cần gửi", required = true)
			@RequestBody EmailRequest request) {
		log.info(request.toString());
		emailService.sendEmail(
				request.getTo(),
				request.getSubject(),
				request.getText(),
				request.isHtml()
		);
		return "Email is being sent.";
	}

	@Operation(summary = "Gửi thông báo",
			description = "API cho phép gửi thông báo đến người dùng")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Thông báo đã được gửi thành công",
					content = @Content(mediaType = "text/plain",
							schema = @Schema(type = "string"))),
			@ApiResponse(responseCode = "400", description = "Dữ liệu đầu vào không hợp lệ")
	})
	@PostMapping("/notify")
	public ResponseEntity<String> sendNotification(
			@Parameter(description = "Thông tin thông báo cần gửi", required = true)
			@RequestBody NotificationEvent notificationEvent) {
		log.info("Sending notification: {}", notificationEvent);
		notificationEventProducer.sendNotificationEvent(notificationEvent);
		return ResponseEntity.ok("Notification sent successfully");
	}

	@GetMapping("/{id}")
	public ResponseEntity<UserResponse> getUserById(@PathVariable String id) {
		User user = userRepository.findById(id).orElseThrow();
		UserResponse res = UserResponse.builder()
			.id(user.getId())
			.username(user.getUsername())
			.name(user.getName())
			.email(user.getEmail())
			.role(user.getRoles().stream().findFirst().map(Enum::name).orElse(null))
			.build();
		return ResponseEntity.ok(res);
	}

	@PutMapping("/profile")
	public ResponseEntity<UserResponse> updateProfile(
			@RequestBody UserResponse request,
			@RequestHeader("Authorization") String authHeader) {
		// Lấy userId từ token
		String token = jwtUtil.extractTokenFromHeader(authHeader);
		String userId = jwtUtil.extractUserId(token);

		User user = userRepository.findById(userId).orElseThrow();

		// Chỉ cho phép cập nhật name và email
		if (request.getName() != null) user.setName(request.getName());
		if (request.getEmail() != null) user.setEmail(request.getEmail());

		userRepository.save(user);

		UserResponse res = UserResponse.builder()
				.id(user.getId())
				.username(user.getUsername())
				.name(user.getName())
				.email(user.getEmail())
				.role(user.getRoles().stream().findFirst().map(Enum::name).orElse(null))
				.companyId(request.getCompanyId())
				.build();

		return ResponseEntity.ok(res);
	}
}