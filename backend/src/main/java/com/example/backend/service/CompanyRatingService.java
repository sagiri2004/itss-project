package com.example.backend.service;

import com.example.backend.dto.request.CompanyRatingRequest;
import com.example.backend.dto.response.CompanyRatingResponse;
import com.example.backend.dto.response.CompanyRatingSummary;

import java.util.List;

/**
 * Service interface for managing company ratings functionality.
 * Provides methods for creating, retrieving, and managing ratings.
 */
public interface CompanyRatingService {
	/**
	 * Create or update a rating for a company by a user.
	 *
	 * @param request Rating request containing stars, comment, and company information
	 * @param userId ID of the user creating the rating
	 * @return The created or updated CompanyRatingResponse
	 */
	CompanyRatingResponse rateCompany(CompanyRatingRequest request, String userId);

	/**
	 * Get all ratings for a specific company.
	 *
	 * @param companyId ID of the company
	 * @return List of CompanyRatingResponse objects
	 */
	List<CompanyRatingResponse> getCompanyRatings(String companyId);

	/**
	 * Get a summary of ratings for a specific company.
	 * Includes average rating, total number of ratings, and distribution by stars.
	 *
	 * @param companyId ID of the company
	 * @return CompanyRatingSummary containing rating metrics
	 */
	CompanyRatingSummary getCompanyRatingSummary(String companyId);

	/**
	 * Delete a rating.
	 * Only the user who created the rating can delete it.
	 *
	 * @param ratingId ID of the rating to delete
	 * @param userId ID of the user requesting deletion
	 */
	void deleteRating(String ratingId, String userId);
}