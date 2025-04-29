package com.example.backend.controller;

import com.example.backend.dto.request.CommentReportRequest;
import com.example.backend.dto.request.ResolveReportRequest;
import com.example.backend.model.CommentReport;
import com.example.backend.service.CommentReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class CommentReportController {
	private final CommentReportService reportService; // Sử dụng interface thay vì implementation

	@PostMapping
	public ResponseEntity<CommentReport> reportComment(
			@Valid @RequestBody CommentReportRequest request,
			@AuthenticationPrincipal UserDetails userDetails) {
		CommentReport report = reportService.reportComment(request, userDetails.getUsername());
		return new ResponseEntity<>(report, HttpStatus.CREATED);
	}

	@GetMapping("/pending")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<List<CommentReport>> getPendingReports() {
		List<CommentReport> reports = reportService.getPendingReports();
		return ResponseEntity.ok(reports);
	}

	@PostMapping("/resolve")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<CommentReport> resolveReport(
			@Valid @RequestBody ResolveReportRequest request,
			@AuthenticationPrincipal UserDetails userDetails) {
		CommentReport report = reportService.resolveReport(request, userDetails.getUsername());
		return ResponseEntity.ok(report);
	}

	@GetMapping("/rating/{ratingId}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<List<CommentReport>> getReportsForRating(@PathVariable String ratingId) {
		List<CommentReport> reports = reportService.getReportsForRating(ratingId);
		return ResponseEntity.ok(reports);
	}
}