package com.example.backend.controller;

import com.example.backend.dto.request.CompanyRatingRequest;
import com.example.backend.dto.response.CompanyRatingResponse;
import com.example.backend.dto.response.CompanyRatingSummary;
import com.example.backend.dto.response.RescueServiceResponse;
import com.example.backend.service.CompanyRatingService;
import com.example.backend.utils.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ratings")
@RequiredArgsConstructor
public class RatingController {
	private final CompanyRatingService ratingService;
	private final JwtUtil jwtUtil;

	@PostMapping
	public ResponseEntity<CompanyRatingResponse> rateCompany(
			@Valid @RequestBody CompanyRatingRequest request,
			@RequestHeader("Authorization") String token) {
		String userId = jwtUtil.extractUserId(jwtUtil.extractTokenFromHeader(token));
		CompanyRatingResponse response = ratingService.rateCompany(request, userId);
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
			@RequestHeader("Authorization") String token) {
		String userId = jwtUtil.extractUserId(jwtUtil.extractTokenFromHeader(token));
		ratingService.deleteRating(ratingId, userId);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/user/{userId}")
	public ResponseEntity<List<CompanyRatingResponse>> getRatingsByUser(@PathVariable String userId) {
		List<CompanyRatingResponse> ratings = ratingService.getRatingsByUser(userId);
		return ResponseEntity.ok(ratings);
	}

	@GetMapping("/service/{serviceId}")
	public ResponseEntity<List<CompanyRatingResponse>> getRatingsByService(@PathVariable String serviceId) {
		List<CompanyRatingResponse> ratings = ratingService.getRatingsByService(serviceId);
		return ResponseEntity.ok(ratings);
	}

	@GetMapping("/search")
	public ResponseEntity<List<CompanyRatingResponse>> searchRatings(
			@RequestParam(required = false) String userId,
			@RequestParam(required = false) String companyId,
			@RequestParam(required = false) String serviceId
	) {
		List<CompanyRatingResponse> ratings = ratingService.searchRatings(userId, companyId, serviceId);
		return ResponseEntity.ok(ratings);
	}

	@GetMapping("/reviewed-services")
	public ResponseEntity<List<RescueServiceResponse>> getReviewedServices() {
		List<RescueServiceResponse> services = ratingService.getReviewedServices();
		return ResponseEntity.ok(services);
	}

	@GetMapping("/unreviewed-services")
	public ResponseEntity<List<RescueServiceResponse>> getUnreviewedServices() {
		List<RescueServiceResponse> services = ratingService.getUnreviewedServices();
		return ResponseEntity.ok(services);
	}

	@GetMapping("/reviewed-services/company/{companyId}")
	public ResponseEntity<List<RescueServiceResponse>> getReviewedServicesByCompany(@PathVariable String companyId) {
		List<RescueServiceResponse> services = ratingService.getReviewedServicesByCompany(companyId);
		return ResponseEntity.ok(services);
	}

	@GetMapping("/unreviewed-services/company/{companyId}")
	public ResponseEntity<List<RescueServiceResponse>> getUnreviewedServicesByCompany(@PathVariable String companyId) {
		List<RescueServiceResponse> services = ratingService.getUnreviewedServicesByCompany(companyId);
		return ResponseEntity.ok(services);
	}
}