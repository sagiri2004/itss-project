package com.example.backend.controller;

import com.example.backend.dto.request.RescueCompanyRequest;
import com.example.backend.dto.response.RescueCompanyResponse;
import com.example.backend.service.RescueCompanyService;
import com.example.backend.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/v1/rescue-companies")
@RequiredArgsConstructor
public class RescueCompanyController {

	private final RescueCompanyService rescueCompanyService;
	private final JwtUtil jwtUtil;

	@PostMapping
	public ResponseEntity<RescueCompanyResponse> create(@RequestBody RescueCompanyRequest request, HttpServletRequest servletRequest) {
		String token = jwtUtil.extractTokenFromHeader(servletRequest.getHeader("Authorization"));
		String userId = jwtUtil.extractUserId(token);
		return ResponseEntity.ok(rescueCompanyService.create(request, userId));
	}

	@PutMapping("/{id}")
	public ResponseEntity<RescueCompanyResponse> update(@PathVariable String id, @RequestBody RescueCompanyRequest request) {
		return ResponseEntity.ok(rescueCompanyService.update(id, request));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable String id) {
		rescueCompanyService.delete(id);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/{id}")
	public ResponseEntity<RescueCompanyResponse> getById(@PathVariable String id) {
		return ResponseEntity.ok(rescueCompanyService.getById(id));
	}

	@GetMapping
	public ResponseEntity<List<RescueCompanyResponse>> getAll() {
		return ResponseEntity.ok(rescueCompanyService.getAll());
	}
}
