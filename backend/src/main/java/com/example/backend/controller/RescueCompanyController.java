package com.example.backend.controller;

import com.example.backend.dto.request.RescueCompanyRequest;
import com.example.backend.dto.response.RescueCompanyResponse;
import com.example.backend.service.RescueCompanyService;
import com.example.backend.utils.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/v1/rescue-companies")
@RequiredArgsConstructor
@Tag(name = "Rescue Company", description = "API quản lý công ty cứu hộ")
public class RescueCompanyController {

	private final RescueCompanyService rescueCompanyService;
	private final JwtUtil jwtUtil;

	@Operation(summary = "Tạo công ty cứu hộ mới",
			description = "API cho phép tạo một công ty cứu hộ mới",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Tạo công ty thành công",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = RescueCompanyResponse.class))),
			@ApiResponse(responseCode = "400", description = "Dữ liệu đầu vào không hợp lệ"),
			@ApiResponse(responseCode = "401", description = "Chưa xác thực")
	})
	@PostMapping
	public ResponseEntity<RescueCompanyResponse> create(
			@Parameter(description = "Thông tin công ty cứu hộ", required = true)
			@RequestBody RescueCompanyRequest request,
			HttpServletRequest servletRequest) {
		String token = jwtUtil.extractTokenFromHeader(servletRequest.getHeader("Authorization"));
		String userId = jwtUtil.extractUserId(token);
		return ResponseEntity.ok(rescueCompanyService.create(request, userId));
	}

	@Operation(summary = "Cập nhật thông tin công ty cứu hộ",
			description = "API cho phép cập nhật thông tin của công ty cứu hộ theo ID",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Cập nhật thành công",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = RescueCompanyResponse.class))),
			@ApiResponse(responseCode = "404", description = "Không tìm thấy công ty"),
			@ApiResponse(responseCode = "400", description = "Dữ liệu đầu vào không hợp lệ"),
			@ApiResponse(responseCode = "401", description = "Chưa xác thực")
	})
	@PutMapping("/{id}")
	public ResponseEntity<RescueCompanyResponse> update(
			@Parameter(description = "ID của công ty cứu hộ", required = true)
			@PathVariable String id,
			@Parameter(description = "Thông tin cần cập nhật", required = true)
			@RequestBody RescueCompanyRequest request) {
		return ResponseEntity.ok(rescueCompanyService.update(id, request));
	}

	@Operation(summary = "Xóa công ty cứu hộ",
			description = "API cho phép xóa công ty cứu hộ theo ID",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "204", description = "Xóa thành công"),
			@ApiResponse(responseCode = "404", description = "Không tìm thấy công ty"),
			@ApiResponse(responseCode = "401", description = "Chưa xác thực")
	})
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(
			@Parameter(description = "ID của công ty cứu hộ", required = true)
			@PathVariable String id) {
		rescueCompanyService.delete(id);
		return ResponseEntity.noContent().build();
	}

	@Operation(summary = "Lấy thông tin công ty cứu hộ theo ID",
			description = "API cho phép lấy thông tin chi tiết của một công ty cứu hộ theo ID")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Lấy thông tin thành công",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = RescueCompanyResponse.class))),
			@ApiResponse(responseCode = "404", description = "Không tìm thấy công ty")
	})
	@GetMapping("/{id}")
	public ResponseEntity<RescueCompanyResponse> getById(
			@Parameter(description = "ID của công ty cứu hộ", required = true)
			@PathVariable String id) {
		return ResponseEntity.ok(rescueCompanyService.getById(id));
	}

	@Operation(summary = "Lấy danh sách tất cả công ty cứu hộ",
			description = "API cho phép lấy danh sách tất cả các công ty cứu hộ")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Lấy danh sách thành công",
					content = @Content(mediaType = "application/json",
							array = @ArraySchema(schema = @Schema(implementation = RescueCompanyResponse.class))))
	})
	@GetMapping
	public ResponseEntity<List<RescueCompanyResponse>> getAll() {
		return ResponseEntity.ok(rescueCompanyService.getAll());
	}

	@Operation(summary = "Lấy thông tin căn bản của công ty cứu hộ",
			description = "API cho phép lấy thông tin căn bản của một công ty cứu hộ theo ID")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Lấy thông tin thành công",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = RescueCompanyResponse.class))),
			@ApiResponse(responseCode = "404", description = "Không tìm thấy công ty")
	})
	@GetMapping("/basic/{id}")
	public ResponseEntity<RescueCompanyResponse> getBasicInfo(@PathVariable String id) {
		RescueCompanyResponse company = rescueCompanyService.getById(id);
		RescueCompanyResponse basic = RescueCompanyResponse.builder()
			.id(company.getId())
			.name(company.getName())
			.phone(company.getPhone())
			.description(company.getDescription())
			.latitude(company.getLatitude())
			.longitude(company.getLongitude())
			.userId(company.getUserId())
			.build();
		return ResponseEntity.ok(basic);
	}
}