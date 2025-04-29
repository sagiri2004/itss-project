package com.example.backend.service;

import com.example.backend.dto.request.CommunityDiscussionRequest;
import com.example.backend.dto.request.MarkDiscussionRequest;
import com.example.backend.dto.response.CommunityDiscussionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service interface for managing community discussions.
 */
public interface CommunityDiscussionService {
	/**
	 * Create a new community discussion.
	 *
	 * @param request DTO containing discussion details
	 * @param creatorId ID of the user creating the discussion
	 * @return Created CommunityDiscussionResponse
	 */
	CommunityDiscussionResponse createDiscussion(CommunityDiscussionRequest request, String creatorId);

	/**
	 * Get a paginated list of all discussions.
	 *
	 * @param pageable Pagination information
	 * @return Page of CommunityDiscussionResponse
	 */
	Page<CommunityDiscussionResponse> getAllDiscussions(Pageable pageable);

	/**
	 * Get a specific discussion by ID.
	 *
	 * @param discussionId ID of the discussion
	 * @return CommunityDiscussionResponse for the requested discussion
	 */
	CommunityDiscussionResponse getDiscussionById(String discussionId);

	/**
	 * Filter discussions by resolved and closed status.
	 *
	 * @param isResolved Whether the discussion is resolved
	 * @param isClosed Whether the discussion is closed
	 * @param pageable Pagination information
	 * @return Page of CommunityDiscussionResponse
	 */
	Page<CommunityDiscussionResponse> getDiscussionsByStatus(Boolean isResolved, Boolean isClosed, Pageable pageable);

	/**
	 * Get discussions by incident type.
	 *
	 * @param incidentType Type of incident
	 * @param pageable Pagination information
	 * @return Page of CommunityDiscussionResponse
	 */
	Page<CommunityDiscussionResponse> getDiscussionsByIncidentType(String incidentType, Pageable pageable);

	/**
	 * Get discussions created by a specific user.
	 *
	 * @param userId ID of the user
	 * @param pageable Pagination information
	 * @return Page of CommunityDiscussionResponse
	 */
	Page<CommunityDiscussionResponse> getDiscussionsByUser(String userId, Pageable pageable);

	/**
	 * Search discussions by keyword in title and content.
	 *
	 * @param keyword Search keyword
	 * @param pageable Pagination information
	 * @return Page of CommunityDiscussionResponse
	 */
	Page<CommunityDiscussionResponse> searchDiscussions(String keyword, Pageable pageable);

	/**
	 * Mark a discussion as resolved or unresolved.
	 *
	 * @param request DTO containing discussion ID and status
	 * @param userId ID of the user making the request
	 * @return Updated CommunityDiscussionResponse
	 */
	CommunityDiscussionResponse markDiscussionAsResolved(MarkDiscussionRequest request, String userId);

	/**
	 * Close or reopen a discussion.
	 *
	 * @param request DTO containing discussion ID and status
	 * @param userId ID of the user making the request
	 * @return Updated CommunityDiscussionResponse
	 */
	CommunityDiscussionResponse closeDiscussion(MarkDiscussionRequest request, String userId);
}