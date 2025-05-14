package com.example.backend.service;

import com.example.backend.dto.request.CompanyRatingRequest;
import com.example.backend.dto.response.CompanyRatingResponse;
import com.example.backend.dto.response.CompanyRatingSummary;
import com.example.backend.dto.response.RescueServiceResponse;

import java.util.List;

/**
 * Service interface for managing company ratings functionality.
 * Provides methods for creating, retrieving, and managing ratings.
 */
public interface CompanyRatingService {
	CompanyRatingResponse rateCompany(CompanyRatingRequest request, String userId);
	List<CompanyRatingResponse> getCompanyRatings(String companyId);
	CompanyRatingSummary getCompanyRatingSummary(String companyId);
	void deleteRating(String ratingId, String userId);
	List<CompanyRatingResponse> getRatingsByUser(String userId);
	List<CompanyRatingResponse> getRatingsByService(String serviceId);
	List<CompanyRatingResponse> searchRatings(String userId, String companyId, String serviceId);
	List<RescueServiceResponse> getReviewedServices();
	List<RescueServiceResponse> getUnreviewedServices();
	List<RescueServiceResponse> getReviewedServicesByCompany(String companyId);
	List<RescueServiceResponse> getUnreviewedServicesByCompany(String companyId);
}