package com.example.backend.controller;

import com.example.backend.dto.request.RescueRequestCreateRequest;
import com.example.backend.dto.response.RescueRequestResponse;
import com.example.backend.model.enums.RescueRequestStatus;
import com.example.backend.service.RescueRequestService;
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
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rescue-requests")
@RequiredArgsConstructor
@Tag(name = "Rescue Requests", description = "API quản lý yêu cầu cứu hộ")
public class RescueRequestController {

	private final RescueRequestService rescueRequestService;
	private final JwtUtil jwtUtil;
	private static final Logger logger = LoggerFactory.getLogger(RescueRequestController.class);

	@Operation(summary = "Tạo yêu cầu cứu hộ mới",
			description = "API cho phép người dùng tạo yêu cầu cứu hộ mới",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Tạo yêu cầu thành công",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = RescueRequestResponse.class))),
			@ApiResponse(responseCode = "400", description = "Dữ liệu đầu vào không hợp lệ"),
			@ApiResponse(responseCode = "401", description = "Chưa xác thực"),
			@ApiResponse(responseCode = "403", description = "Không có quyền thực hiện")
	})
	@PostMapping
	public ResponseEntity<RescueRequestResponse> createRequest(
			@Valid @RequestBody RescueRequestCreateRequest request,
			@RequestHeader("Authorization") String authHeader
	) {
		logger.info("Received POST request to create rescue request: {}", request);
		String token = jwtUtil.extractTokenFromHeader(authHeader);
		String userId = jwtUtil.extractUserId(token);
		return ResponseEntity.ok(rescueRequestService.createRescueRequest(request, userId));
	}

	@Operation(summary = "Lấy danh sách tất cả yêu cầu cứu hộ của người dùng",
			description = "API cho phép người dùng lấy danh sách tất cả các yêu cầu cứu hộ của mình",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Lấy danh sách thành công",
					content = @Content(mediaType = "application/json",
							array = @ArraySchema(schema = @Schema(implementation = RescueRequestResponse.class)))),
			@ApiResponse(responseCode = "401", description = "Chưa xác thực"),
			@ApiResponse(responseCode = "403", description = "Không có quyền thực hiện")
	})
	@GetMapping("/user")
	public ResponseEntity<List<RescueRequestResponse>> getUserRequests(
			@Parameter(description = "Token xác thực", required = true)
			@RequestHeader("Authorization") String authHeader
	) {
		logger.info("Getting user requests");
		org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
		logger.info("Authorities: {}", authentication.getAuthorities());
		logger.info("Principal: {}", authentication.getPrincipal());
		logger.info("Details: {}", authentication.getDetails());
		String token = jwtUtil.extractTokenFromHeader(authHeader);
		String userId = jwtUtil.extractUserId(token);
		return ResponseEntity.ok(rescueRequestService.getUserRequests(userId));
	}

	@Operation(summary = "Lấy danh sách yêu cầu cứu hộ cho công ty",
			description = "API cho phép công ty cứu hộ lấy danh sách các yêu cầu cứu hộ (có thể lọc theo trạng thái)",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Lấy danh sách thành công",
					content = @Content(mediaType = "application/json",
							array = @ArraySchema(schema = @Schema(implementation = RescueRequestResponse.class)))),
			@ApiResponse(responseCode = "401", description = "Chưa xác thực"),
			@ApiResponse(responseCode = "403", description = "Không có quyền thực hiện")
	})
	@GetMapping("/company")
	public ResponseEntity<List<RescueRequestResponse>> getRequestsForCompany(
			@Parameter(description = "Token xác thực", required = true)
			@RequestHeader("Authorization") String token,
			@Parameter(description = "Trạng thái yêu cầu cứu hộ cần lọc", required = false)
			@RequestParam(value = "status", required = false) RescueRequestStatus status
	) {
		    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication != null) {
        System.out.println("[RescueRequestController] Principal: " + authentication.getPrincipal());
        System.out.println("[RescueRequestController] Authorities: " + authentication.getAuthorities());
    } else {
        System.out.println("[RescueRequestController] No authentication present");
    }
		return ResponseEntity.ok(rescueRequestService.getRequestsForCompany(token, status));
	}

	@Operation(summary = "Chấp nhận yêu cầu cứu hộ",
			description = "API cho phép công ty cứu hộ chấp nhận yêu cầu cứu hộ",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Chấp nhận yêu cầu thành công",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = RescueRequestResponse.class))),
			@ApiResponse(responseCode = "400", description = "Không thể chấp nhận yêu cầu"),
			@ApiResponse(responseCode = "401", description = "Chưa xác thực"),
			@ApiResponse(responseCode = "403", description = "Không có quyền thực hiện"),
			@ApiResponse(responseCode = "404", description = "Không tìm thấy yêu cầu")
	})
	@PutMapping("/{id}/accept")
	public ResponseEntity<RescueRequestResponse> acceptRequest(
			@Parameter(description = "ID của yêu cầu cứu hộ", required = true)
			@PathVariable String id,
			@Parameter(description = "Token xác thực", required = true)
			@RequestHeader("Authorization") String token) {
		return ResponseEntity.ok(rescueRequestService.acceptRequest(id, token));
	}

	@Operation(summary = "Hủy yêu cầu cứu hộ (bởi người dùng)",
			description = "API cho phép người dùng hủy yêu cầu cứu hộ của mình",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Hủy yêu cầu thành công",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = RescueRequestResponse.class))),
			@ApiResponse(responseCode = "400", description = "Không thể hủy yêu cầu"),
			@ApiResponse(responseCode = "401", description = "Chưa xác thực"),
			@ApiResponse(responseCode = "403", description = "Không có quyền thực hiện"),
			@ApiResponse(responseCode = "404", description = "Không tìm thấy yêu cầu")
	})
	@PutMapping("/{id}/cancel-by-user")
	public ResponseEntity<RescueRequestResponse> cancelByUser(
			@Parameter(description = "ID của yêu cầu cứu hộ", required = true)
			@PathVariable String id,
			@Parameter(description = "Token xác thực", required = true)
			@RequestHeader("Authorization") String token) {
		return ResponseEntity.ok(rescueRequestService.cancelByUser(id, token));
	}

	@Operation(summary = "Hủy yêu cầu cứu hộ (bởi công ty)",
			description = "API cho phép công ty cứu hộ hủy yêu cầu cứu hộ đã nhận",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Hủy yêu cầu thành công",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = RescueRequestResponse.class))),
			@ApiResponse(responseCode = "400", description = "Không thể hủy yêu cầu"),
			@ApiResponse(responseCode = "401", description = "Chưa xác thực"),
			@ApiResponse(responseCode = "403", description = "Không có quyền thực hiện"),
			@ApiResponse(responseCode = "404", description = "Không tìm thấy yêu cầu")
	})
	@PutMapping("/{id}/cancel-by-company")
	public ResponseEntity<RescueRequestResponse> cancelByCompany(
			@Parameter(description = "ID của yêu cầu cứu hộ", required = true)
			@PathVariable String id,
			@Parameter(description = "Token xác thực", required = true)
			@RequestHeader("Authorization") String token) {
		return ResponseEntity.ok(rescueRequestService.cancelByCompany(id, token));
	}

	@Operation(summary = "Điều phối xe cứu hộ",
			description = "API cho phép công ty cứu hộ điều phối xe cứu hộ cho một yêu cầu",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Điều phối xe thành công",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = RescueRequestResponse.class))),
			@ApiResponse(responseCode = "400", description = "Không thể điều phối xe"),
			@ApiResponse(responseCode = "401", description = "Chưa xác thực"),
			@ApiResponse(responseCode = "403", description = "Không có quyền thực hiện"),
			@ApiResponse(responseCode = "404", description = "Không tìm thấy yêu cầu hoặc xe")
	})
	@PutMapping("/{id}/dispatch-vehicle")
	public ResponseEntity<RescueRequestResponse> dispatchRescueVehicle(
			@Parameter(description = "ID của yêu cầu cứu hộ", required = true)
			@PathVariable String id,
			@Parameter(description = "ID của xe cứu hộ", required = true)
			@RequestParam String vehicleId,
			@Parameter(description = "Token xác thực", required = true)
			@RequestHeader("Authorization") String token) {
		return ResponseEntity.ok(rescueRequestService.dispatchRescueVehicle(id, vehicleId, token));
	}

	@Operation(summary = "Đánh dấu xe đã đến nơi",
			description = "API cho phép đánh dấu xe cứu hộ đã đến nơi cần cứu hộ",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Cập nhật trạng thái thành công",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = RescueRequestResponse.class))),
			@ApiResponse(responseCode = "400", description = "Không thể cập nhật trạng thái"),
			@ApiResponse(responseCode = "401", description = "Chưa xác thực"),
			@ApiResponse(responseCode = "403", description = "Không có quyền thực hiện"),
			@ApiResponse(responseCode = "404", description = "Không tìm thấy yêu cầu")
	})
	@PutMapping("/{id}/vehicle-arrived")
	public ResponseEntity<RescueRequestResponse> vehicleArrived(
			@Parameter(description = "ID của yêu cầu cứu hộ", required = true)
			@PathVariable String id,
			@Parameter(description = "Token xác thực", required = true)
			@RequestHeader("Authorization") String token) {
		return ResponseEntity.ok(rescueRequestService.markVehicleArrived(id, token));
	}

	@Operation(summary = "Đánh dấu đã kiểm tra xong",
			description = "API cho phép đánh dấu đã kiểm tra xong tình trạng xe cần cứu hộ",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Cập nhật trạng thái thành công",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = RescueRequestResponse.class))),
			@ApiResponse(responseCode = "400", description = "Không thể cập nhật trạng thái"),
			@ApiResponse(responseCode = "401", description = "Chưa xác thực"),
			@ApiResponse(responseCode = "403", description = "Không có quyền thực hiện"),
			@ApiResponse(responseCode = "404", description = "Không tìm thấy yêu cầu")
	})
	@PutMapping("/{id}/inspection-done")
	public ResponseEntity<RescueRequestResponse> inspectionDone(
			@Parameter(description = "ID của yêu cầu cứu hộ", required = true)
			@PathVariable String id,
			@Parameter(description = "Token xác thực", required = true)
			@RequestHeader("Authorization") String token) {
		return ResponseEntity.ok(rescueRequestService.markInspectionDone(id, token));
	}

	@Operation(summary = "Cập nhật giá",
			description = "API cho phép công ty cứu hộ cập nhật giá dịch vụ sau khi kiểm tra",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Cập nhật giá thành công",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = RescueRequestResponse.class))),
			@ApiResponse(responseCode = "400", description = "Không thể cập nhật giá"),
			@ApiResponse(responseCode = "401", description = "Chưa xác thực"),
			@ApiResponse(responseCode = "403", description = "Không có quyền thực hiện"),
			@ApiResponse(responseCode = "404", description = "Không tìm thấy yêu cầu")
	})
	@PutMapping("/{id}/update-price")
	public ResponseEntity<RescueRequestResponse> updatePrice(
			@Parameter(description = "ID của yêu cầu cứu hộ", required = true)
			@PathVariable String id,
			@Parameter(description = "Giá mới", required = true)
			@RequestParam Double newPrice,
			@Parameter(description = "Ghi chú về giá", required = false)
			@RequestParam(required = false) String notes,
			@Parameter(description = "Token xác thực", required = true)
			@RequestHeader("Authorization") String token) {
		return ResponseEntity.ok(rescueRequestService.updatePrice(id, newPrice, notes, token));
	}

	@Operation(summary = "Chấp nhận giá",
			description = "API cho phép người dùng chấp nhận giá dịch vụ",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Chấp nhận giá thành công",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = RescueRequestResponse.class))),
			@ApiResponse(responseCode = "400", description = "Không thể chấp nhận giá"),
			@ApiResponse(responseCode = "401", description = "Chưa xác thực"),
			@ApiResponse(responseCode = "403", description = "Không có quyền thực hiện"),
			@ApiResponse(responseCode = "404", description = "Không tìm thấy yêu cầu")
	})
	@PutMapping("/{id}/confirm-price")
	public ResponseEntity<RescueRequestResponse> confirmPrice(
			@Parameter(description = "ID của yêu cầu cứu hộ", required = true)
			@PathVariable String id,
			@Parameter(description = "Token xác thực", required = true)
			@RequestHeader("Authorization") String token) {
		return ResponseEntity.ok(rescueRequestService.confirmPrice(id, token));
	}

	@Operation(summary = "Từ chối giá",
			description = "API cho phép người dùng từ chối giá dịch vụ",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Từ chối giá thành công",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = RescueRequestResponse.class))),
			@ApiResponse(responseCode = "400", description = "Không thể từ chối giá"),
			@ApiResponse(responseCode = "401", description = "Chưa xác thực"),
			@ApiResponse(responseCode = "403", description = "Không có quyền thực hiện"),
			@ApiResponse(responseCode = "404", description = "Không tìm thấy yêu cầu")
	})
	@PutMapping("/{id}/reject-price")
	public ResponseEntity<RescueRequestResponse> rejectPrice(
			@Parameter(description = "ID của yêu cầu cứu hộ", required = true)
			@PathVariable String id,
			@Parameter(description = "Token xác thực", required = true)
			@RequestHeader("Authorization") String token) {
		return ResponseEntity.ok(rescueRequestService.rejectPrice(id, token));
	}

	@Operation(summary = "Bắt đầu sửa chữa",
			description = "API cho phép công ty cứu hộ đánh dấu bắt đầu sửa chữa",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Cập nhật trạng thái thành công",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = RescueRequestResponse.class))),
			@ApiResponse(responseCode = "400", description = "Không thể cập nhật trạng thái"),
			@ApiResponse(responseCode = "401", description = "Chưa xác thực"),
			@ApiResponse(responseCode = "403", description = "Không có quyền thực hiện"),
			@ApiResponse(responseCode = "404", description = "Không tìm thấy yêu cầu")
	})
	@PutMapping("/{id}/start-repair")
	public ResponseEntity<RescueRequestResponse> startRepair(
			@Parameter(description = "ID của yêu cầu cứu hộ", required = true)
			@PathVariable String id,
			@Parameter(description = "Token xác thực", required = true)
			@RequestHeader("Authorization") String token) {
		return ResponseEntity.ok(rescueRequestService.startRepair(id, token));
	}

	@Operation(summary = "Hoàn thành sửa chữa",
			description = "API cho phép công ty cứu hộ đánh dấu hoàn thành sửa chữa",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Cập nhật trạng thái thành công",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = RescueRequestResponse.class))),
			@ApiResponse(responseCode = "400", description = "Không thể cập nhật trạng thái"),
			@ApiResponse(responseCode = "401", description = "Chưa xác thực"),
			@ApiResponse(responseCode = "403", description = "Không có quyền thực hiện"),
			@ApiResponse(responseCode = "404", description = "Không tìm thấy yêu cầu")
	})
	@PutMapping("/{id}/complete-repair")
	public ResponseEntity<RescueRequestResponse> completeRepair(
			@Parameter(description = "ID của yêu cầu cứu hộ", required = true)
			@PathVariable String id,
			@Parameter(description = "Token xác thực", required = true)
			@RequestHeader("Authorization") String token) {
		return ResponseEntity.ok(rescueRequestService.completeRepair(id, token));
	}

	@Operation(summary = "Lấy thông tin chi tiết của yêu cầu cứu hộ",
			description = "API cho phép lấy thông tin chi tiết của một yêu cầu cứu hộ dựa trên ID",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Lấy thông tin thành công",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = RescueRequestResponse.class))),
			@ApiResponse(responseCode = "401", description = "Chưa xác thực"),
			@ApiResponse(responseCode = "403", description = "Không có quyền thực hiện"),
			@ApiResponse(responseCode = "404", description = "Không tìm thấy yêu cầu cứu hộ")
	})
	@GetMapping("/{id}")
	public ResponseEntity<RescueRequestResponse> getRescueRequestById(
			@Parameter(description = "ID của yêu cầu cứu hộ", required = true)
			@PathVariable String id,
			@Parameter(description = "Token xác thực", required = true)
			@RequestHeader("Authorization") String authHeader
	) {
		logger.info("Getting rescue request details for id: {}", id);
		String token = jwtUtil.extractTokenFromHeader(authHeader);
		String userId = jwtUtil.extractUserId(token);
		RescueRequestResponse response = rescueRequestService.getRescueRequestById(id, userId);
		return ResponseEntity.ok(response);
	}
}