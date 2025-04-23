package com.example.backend.controller;

import com.example.backend.dto.request.RescueServiceRequest;
import com.example.backend.dto.response.RescueServiceResponse;
import com.example.backend.service.RescueServiceService;
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

import java.util.List;

@RestController
@RequestMapping("/api/v1/rescue-services")
@RequiredArgsConstructor
@Tag(name = "Rescue Services", description = "API quản lý dịch vụ cứu hộ")
public class RescueServiceController {

	private final RescueServiceService rescueServiceService;

	@Operation(summary = "Tạo mới dịch vụ cứu hộ",
			description = "API cho phép tạo dịch vụ cứu hộ mới",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Tạo dịch vụ thành công",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = RescueServiceResponse.class))),
			@ApiResponse(responseCode = "400", description = "Dữ liệu đầu vào không hợp lệ"),
			@ApiResponse(responseCode = "401", description = "Chưa xác thực")
	})
	@PostMapping
	public ResponseEntity<RescueServiceResponse> create(
			@Parameter(description = "Thông tin dịch vụ cứu hộ", required = true)
			@RequestBody RescueServiceRequest request) {
		return ResponseEntity.ok(rescueServiceService.create(request));
	}

	@Operation(summary = "Lấy danh sách dịch vụ cứu hộ theo công ty",
			description = "API cho phép lấy danh sách dịch vụ cứu hộ theo ID công ty")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Lấy danh sách thành công",
					content = @Content(mediaType = "application/json",
							array = @ArraySchema(schema = @Schema(implementation = RescueServiceResponse.class)))),
			@ApiResponse(responseCode = "404", description = "Không tìm thấy công ty")
	})
	@GetMapping("/company/{companyId}")
	public ResponseEntity<List<RescueServiceResponse>> getByCompany(
			@Parameter(description = "ID của công ty cứu hộ", required = true)
			@PathVariable String companyId) {
		return ResponseEntity.ok(rescueServiceService.getByCompany(companyId));
	}

	@Operation(summary = "Lấy tất cả dịch vụ cứu hộ",
			description = "API cho phép lấy danh sách tất cả các dịch vụ cứu hộ")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Lấy danh sách thành công",
					content = @Content(mediaType = "application/json",
							array = @ArraySchema(schema = @Schema(implementation = RescueServiceResponse.class))))
	})
	@GetMapping
	public ResponseEntity<List<RescueServiceResponse>> getAll() {
		return ResponseEntity.ok(rescueServiceService.getAll());
	}
}
