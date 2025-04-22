package com.example.backend.controller;

import com.example.backend.dto.request.RescueServiceRequest;
import com.example.backend.dto.response.RescueServiceResponse;
import com.example.backend.service.RescueServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rescue-services")
@RequiredArgsConstructor
public class RescueServiceController {

	private final RescueServiceService service;

	@PostMapping
	public ResponseEntity<RescueServiceResponse> create(@RequestBody RescueServiceRequest request) {
		return ResponseEntity.ok(service.create(request));
	}

	@GetMapping("/company/{companyId}")
	public ResponseEntity<List<RescueServiceResponse>> getByCompany(@PathVariable String companyId) {
		return ResponseEntity.ok(service.getByCompany(companyId));
	}

	@GetMapping
	public ResponseEntity<List<RescueServiceResponse>> getAll() {
		return ResponseEntity.ok(service.getAll());
	}
}
