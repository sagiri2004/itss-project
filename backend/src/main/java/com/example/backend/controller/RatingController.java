package com.example.backend.controller;

import com.example.backend.dto.request.CompanyRatingRequest;
import com.example.backend.dto.response.CompanyRatingResponse;
import com.example.backend.dto.response.CompanyRatingSummary;
import com.example.backend.service.CompanyRatingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ratings")
@RequiredArgsConstructor
public class RatingController {
	private final CompanyRatingService ratingService; // Sử dụng interface thay vì implementation

	@PostMapping
	public ResponseEntity<CompanyRatingResponse> rateCompany(
			@Valid @RequestBody CompanyRatingRequest request,
			@AuthenticationPrincipal UserDetails userDetails) {
		CompanyRatingResponse response = ratingService.rateCompany(request, userDetails.getUsername());
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@GetMapping("/company/{companyId}")
	public ResponseEntity<List<CompanyRatingResponse>> getCompanyRatings(@PathVariable String companyId) {
		List<CompanyRatingResponse> ratings = ratingService.getCompanyRatings(companyId);
		return ResponseEntity.ok(ratings);
	}

	@GetMapping("/summary/company/{companyId}")
	public ResponseEntity<CompanyRatingSummary> getCompanyRatingSummary(@PathVariable String companyId) {
		CompanyRatingSummary summary = ratingService.getCompanyRatingSummary(companyId);
		return ResponseEntity.ok(summary);
	}

	@DeleteMapping("/{ratingId}")
	public ResponseEntity<Void> deleteRating(
			@PathVariable String ratingId,
			@AuthenticationPrincipal UserDetails userDetails) {
		ratingService.deleteRating(ratingId, userDetails.getUsername());
		return ResponseEntity.noContent().build();
	}
}