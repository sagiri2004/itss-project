package com.example.backend.controller;

import com.example.backend.dto.request.RescueRequestCreateRequest;
import com.example.backend.dto.response.RescueRequestResponse;
import com.example.backend.model.enums.RescueRequestStatus;
import com.example.backend.service.RescueRequestService;
import com.example.backend.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rescue-requests")
@RequiredArgsConstructor
public class RescueRequestController {

	private final RescueRequestService rescueRequestService;
	private final JwtUtil jwtUtil;

	@PostMapping
	@PreAuthorize("hasRole('USER')")
	public ResponseEntity<RescueRequestResponse> createRequest(
			@RequestBody RescueRequestCreateRequest request,
			@RequestHeader("Authorization") String authHeader
	) {
		String token = jwtUtil.extractTokenFromHeader(authHeader);
		String userId = jwtUtil.extractUserId(token);
		return ResponseEntity.ok(rescueRequestService.createRescueRequest(request, userId));
	}

	@GetMapping("/company")
	@PreAuthorize("hasRole('COMPANY')")
	public ResponseEntity<List<RescueRequestResponse>> getRequestsForCompany(
			@RequestHeader("Authorization") String token,
			@RequestParam(value = "status", required = false) RescueRequestStatus status
	) {
		return ResponseEntity.ok(rescueRequestService.getRequestsForCompany(token, status));
	}

	@PutMapping("/{id}/accept")
	@PreAuthorize("hasRole('COMPANY')")
	public ResponseEntity<RescueRequestResponse> acceptRequest(@PathVariable String id, @RequestHeader("Authorization") String token) {
		return ResponseEntity.ok(rescueRequestService.acceptRequest(id, token));
	}

	@PutMapping("/{id}/cancel-by-user")
	@PreAuthorize("hasRole('USER')")
	public ResponseEntity<RescueRequestResponse> cancelByUser(@PathVariable String id, @RequestHeader("Authorization") String token) {
		return ResponseEntity.ok(rescueRequestService.cancelByUser(id, token));
	}

	@PutMapping("/{id}/cancel-by-company")
	@PreAuthorize("hasRole('COMPANY')")
	public ResponseEntity<RescueRequestResponse> cancelByCompany(@PathVariable String id, @RequestHeader("Authorization") String token) {
		return ResponseEntity.ok(rescueRequestService.cancelByCompany(id, token));
	}

	@PutMapping("/{id}/dispatch-vehicle")
	@PreAuthorize("hasRole('COMPANY')")
	public ResponseEntity<RescueRequestResponse> dispatchRescueVehicle(@PathVariable String id, @RequestParam String vehicleId, @RequestHeader("Authorization") String token) {
		return ResponseEntity.ok(rescueRequestService.dispatchRescueVehicle(id, vehicleId, token));
	}
	@PutMapping("/{id}/vehicle-arrived")
	@PreAuthorize("hasRole('COMPANY')")
	public ResponseEntity<RescueRequestResponse> vehicleArrived(@PathVariable String id,
	                                                            @RequestHeader("Authorization") String token) {
		return ResponseEntity.ok(rescueRequestService.markVehicleArrived(id, token));
	}

	@PutMapping("/{id}/inspection-done")
	@PreAuthorize("hasRole('COMPANY')")
	public ResponseEntity<RescueRequestResponse> inspectionDone(@PathVariable String id,
	                                                            @RequestHeader("Authorization") String token) {
		return ResponseEntity.ok(rescueRequestService.markInspectionDone(id, token));
	}

	@PutMapping("/{id}/update-price")
	@PreAuthorize("hasRole('COMPANY')")
	public ResponseEntity<RescueRequestResponse> updatePrice(@PathVariable String id,
	                                                         @RequestParam Double newPrice,
	                                                         @RequestParam(required = false) String notes,
	                                                         @RequestHeader("Authorization") String token) {
		return ResponseEntity.ok(rescueRequestService.updatePrice(id, newPrice, notes, token));
	}

	@PutMapping("/{id}/confirm-price")
	@PreAuthorize("hasRole('USER')")
	public ResponseEntity<RescueRequestResponse> confirmPrice(
			@PathVariable String id,
			@RequestHeader("Authorization") String token) {
		return ResponseEntity.ok(rescueRequestService.confirmPrice(id, token));
	}

	@PutMapping("/{id}/reject-price")
	@PreAuthorize("hasRole('USER')")
	public ResponseEntity<RescueRequestResponse> rejectPrice(
			@PathVariable String id,
			@RequestHeader("Authorization") String token) {
		return ResponseEntity.ok(rescueRequestService.rejectPrice(id, token));
	}

	@PutMapping("/{id}/start-repair")
	@PreAuthorize("hasRole('COMPANY')")
	public ResponseEntity<RescueRequestResponse> startRepair(
			@PathVariable String id,
			@RequestHeader("Authorization") String token) {
		return ResponseEntity.ok(rescueRequestService.startRepair(id, token));
	}

	@PutMapping("/{id}/complete-repair")
	@PreAuthorize("hasRole('COMPANY')")
	public ResponseEntity<RescueRequestResponse> completeRepair(
			@PathVariable String id,
			@RequestHeader("Authorization") String token) {
		return ResponseEntity.ok(rescueRequestService.completeRepair(id, token));
	}
}
