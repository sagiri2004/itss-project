package com.example.backend.controller;

import com.example.backend.dto.request.ResponseReportRequest;
import com.example.backend.dto.request.ResolveReportRequest;
import com.example.backend.model.ResponseReport;
import com.example.backend.service.ResponseReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/response-reports")
@RequiredArgsConstructor
public class ResponseReportController {
	private final ResponseReportService reportService;

	@PostMapping
	@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
	public ResponseEntity<ResponseReport> reportResponse(
			@Valid @RequestBody ResponseReportRequest request,
			@AuthenticationPrincipal UserDetails userDetails) {
		ResponseReport report = reportService.reportResponse(request, userDetails.getUsername());
		return new ResponseEntity<>(report, HttpStatus.CREATED);
	}

	@GetMapping("/pending")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<List<ResponseReport>> getPendingReports() {
		List<ResponseReport> reports = reportService.getPendingReports();
		return ResponseEntity.ok(reports);
	}

	@PostMapping("/resolve")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<ResponseReport> resolveReport(
			@Valid @RequestBody ResolveReportRequest request,
			@AuthenticationPrincipal UserDetails userDetails) {
		ResponseReport report = reportService.resolveReport(request, userDetails.getUsername());
		return ResponseEntity.ok(report);
	}

	@GetMapping("/response/{responseId}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<List<ResponseReport>> getReportsForResponse(@PathVariable String responseId) {
		List<ResponseReport> reports = reportService.getReportsForResponse(responseId);
		return ResponseEntity.ok(reports);
	}

	@GetMapping("/check")
	@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
	public ResponseEntity<Boolean> hasUserReportedResponse(
			@RequestParam String responseId,
			@AuthenticationPrincipal UserDetails userDetails) {
		boolean hasReported = reportService.hasUserReportedResponse(responseId, userDetails.getUsername());
		return ResponseEntity.ok(hasReported);
	}
}