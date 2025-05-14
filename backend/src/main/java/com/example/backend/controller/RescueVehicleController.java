package com.example.backend.controller;

import com.example.backend.dto.request.RescueVehicleRequest;
import com.example.backend.dto.response.RescueVehicleResponse;
import com.example.backend.model.enums.RescueEquipment;
import com.example.backend.service.RescueVehicleService;
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
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rescue-vehicles")
@RequiredArgsConstructor
@Tag(name = "Rescue Vehicles", description = "API quản lý xe cứu hộ")
public class RescueVehicleController {

	private final RescueVehicleService vehicleService;

	@Operation(summary = "Tạo xe cứu hộ mới",
			description = "API cho phép tạo một xe cứu hộ mới",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Tạo xe cứu hộ thành công",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = RescueVehicleResponse.class))),
			@ApiResponse(responseCode = "400", description = "Dữ liệu đầu vào không hợp lệ"),
			@ApiResponse(responseCode = "401", description = "Chưa xác thực")
	})
	@PostMapping
	public RescueVehicleResponse create(
			@Parameter(description = "Thông tin xe cứu hộ", required = true)
			@RequestBody RescueVehicleRequest request) {
		return vehicleService.create(request);
	}

	@Operation(summary = "Cập nhật thông tin xe cứu hộ",
			description = "API cho phép cập nhật thông tin của xe cứu hộ theo ID",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Cập nhật thành công",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = RescueVehicleResponse.class))),
			@ApiResponse(responseCode = "404", description = "Không tìm thấy xe cứu hộ"),
			@ApiResponse(responseCode = "400", description = "Dữ liệu đầu vào không hợp lệ"),
			@ApiResponse(responseCode = "401", description = "Chưa xác thực")
	})
	@PutMapping("/{id}")
	public RescueVehicleResponse update(
			@Parameter(description = "ID của xe cứu hộ", required = true)
			@PathVariable String id,
			@Parameter(description = "Thông tin cần cập nhật", required = true)
			@RequestBody RescueVehicleRequest request) {
		return vehicleService.update(id, request);
	}

	@Operation(summary = "Xóa xe cứu hộ",
			description = "API cho phép xóa xe cứu hộ theo ID",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "204", description = "Xóa thành công"),
			@ApiResponse(responseCode = "404", description = "Không tìm thấy xe cứu hộ"),
			@ApiResponse(responseCode = "401", description = "Chưa xác thực")
	})
	@DeleteMapping("/{id}")
	public void delete(
			@Parameter(description = "ID của xe cứu hộ", required = true)
			@PathVariable String id) {
		vehicleService.delete(id);
	}

	@Operation(summary = "Lấy thông tin xe cứu hộ theo ID",
			description = "API cho phép lấy thông tin chi tiết của một xe cứu hộ theo ID")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Lấy thông tin thành công",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = RescueVehicleResponse.class))),
			@ApiResponse(responseCode = "404", description = "Không tìm thấy xe cứu hộ")
	})
	@GetMapping("/{id}")
	public RescueVehicleResponse getById(
			@Parameter(description = "ID của xe cứu hộ", required = true)
			@PathVariable String id) {
		return vehicleService.getById(id);
	}

	@Operation(summary = "Lấy danh sách tất cả xe cứu hộ",
			description = "API cho phép lấy danh sách tất cả các xe cứu hộ")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Lấy danh sách thành công",
					content = @Content(mediaType = "application/json",
							array = @ArraySchema(schema = @Schema(implementation = RescueVehicleResponse.class))))
	})
	@GetMapping
	public List<RescueVehicleResponse> getAll() {
		return vehicleService.getAll();
	}

	@Operation(summary = "Lấy danh sách loại thiết bị cứu hộ",
			description = "API cho phép lấy danh sách tất cả các loại thiết bị cứu hộ có sẵn")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Lấy danh sách thành công",
					content = @Content(mediaType = "application/json",
							array = @ArraySchema(schema = @Schema(implementation = RescueEquipment.class))))
	})
	@GetMapping("/equipment-types")
	public RescueEquipment[] getEquipmentTypes() {
		return RescueEquipment.values();
	}

	@Operation(summary = "Lấy danh sách xe cứu hộ theo công ty",
			description = "API cho phép lấy danh sách tất cả các xe cứu hộ của một công ty",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Lấy danh sách thành công",
					content = @Content(mediaType = "application/json",
							array = @ArraySchema(schema = @Schema(implementation = RescueVehicleResponse.class))))
	})
	@GetMapping("/company/{companyId}")
	public List<RescueVehicleResponse> getByCompany(@PathVariable String companyId) {
		return vehicleService.getByCompany(companyId);
	}
}