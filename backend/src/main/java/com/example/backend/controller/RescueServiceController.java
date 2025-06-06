package com.example.backend.controller;

import com.example.backend.dto.request.RescueServiceDeletionRequest;
import com.example.backend.dto.request.RescueServiceRequest;
import com.example.backend.dto.response.RescueServiceResponse;
import com.example.backend.dto.response.RescueServiceDeletionResponse;
import com.example.backend.model.enums.RescueServiceType;
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

	@Operation(summary = "Tìm dịch vụ cứu hộ gần nhất",
			description = "API tìm các dịch vụ cứu hộ gần nhất theo tọa độ người dùng và loại dịch vụ")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Lấy danh sách thành công",
					content = @Content(mediaType = "application/json",
							array = @ArraySchema(schema = @Schema(implementation = RescueServiceResponse.class)))),
			@ApiResponse(responseCode = "400", description = "Tọa độ hoặc loại dịch vụ không hợp lệ")
	})
	@GetMapping("/nearby")
	public ResponseEntity<List<RescueServiceResponse>> findNearbyServices(
			@Parameter(description = "Vĩ độ của người dùng", required = true)
			@RequestParam Double latitude,
			@Parameter(description = "Kinh độ của người dùng", required = true)
			@RequestParam Double longitude,
			@Parameter(description = "Loại dịch vụ cứu hộ", required = true)
			@RequestParam RescueServiceType serviceType,
			@Parameter(description = "Số lượng dịch vụ trả về (mặc định: 10)")
			@RequestParam(defaultValue = "10") Integer limit) {
		return ResponseEntity.ok(rescueServiceService.findNearbyServices(latitude, longitude, serviceType, limit));
	}

	@Operation(summary = "Gửi yêu cầu xóa dịch vụ cứu hộ",
			description = "API cho phép công ty gửi yêu cầu xóa dịch vụ đến admin",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Yêu cầu xóa đã được gửi",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = RescueServiceDeletionResponse.class))),
			@ApiResponse(responseCode = "400", description = "Dữ liệu đầu vào không hợp lệ"),
			@ApiResponse(responseCode = "401", description = "Chưa xác thực"),
			@ApiResponse(responseCode = "403", description = "Không có quyền")
	})
	@PostMapping("/{serviceId}/request-deletion")
	public ResponseEntity<RescueServiceDeletionResponse> requestServiceDeletion(
			@Parameter(description = "ID của dịch vụ cứu hộ", required = true)
			@PathVariable String serviceId,
			@Parameter(description = "Thông tin yêu cầu xóa", required = true)
			@RequestBody RescueServiceDeletionRequest request) {
		return ResponseEntity.ok(rescueServiceService.requestDeletion(serviceId, request));
	}

	@Operation(summary = "Cập nhật thông tin dịch vụ cứu hộ",
			description = "API cho phép công ty cập nhật thông tin dịch vụ cứu hộ",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Cập nhật dịch vụ thành công",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = RescueServiceResponse.class))),
			@ApiResponse(responseCode = "400", description = "Dữ liệu đầu vào không hợp lệ"),
			@ApiResponse(responseCode = "401", description = "Chưa xác thực"),
			@ApiResponse(responseCode = "403", description = "Không có quyền"),
			@ApiResponse(responseCode = "404", description = "Không tìm thấy dịch vụ hoặc công ty")
	})
	@PutMapping("/{serviceId}")
	public ResponseEntity<RescueServiceResponse> updateService(
			@Parameter(description = "ID của dịch vụ cứu hộ", required = true)
			@PathVariable String serviceId,
			@Parameter(description = "Thông tin cập nhật dịch vụ", required = true)
			@RequestBody RescueServiceRequest request) {
		return ResponseEntity.ok(rescueServiceService.update(serviceId, request));
	}

}