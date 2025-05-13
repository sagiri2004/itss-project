package com.example.backend.service;

import com.example.backend.dto.request.DiscussionResponseRequest;
import com.example.backend.dto.request.MarkResponseHelpfulRequest;
import com.example.backend.dto.request.VoteRequest;
import com.example.backend.dto.response.DiscussionResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service interface for managing responses to community discussions.
 */
public interface DiscussionResponseService {
	/**
	 * Add a response to a discussion.
	 *
	 * @param request DTO containing response details
	 * @param responderId ID of the user responding
	 * @return Created DiscussionResponseDTO
	 */
	DiscussionResponseDTO addResponse(DiscussionResponseRequest request, String responderId);

	/**
	 * Get all responses for a discussion.
	 *
	 * @param discussionId ID of the discussion
	 * @param userId ID of the requesting user (to check if they've reported responses)
	 * @param sortByVotes Whether to sort by votes (true) or chronologically (false)
	 * @return List of DiscussionResponseDTO
	 */
	List<DiscussionResponseDTO> getResponsesByDiscussion(String discussionId, String userId, Boolean sortByVotes);

	/**
	 * Get responses by a specific user.
	 *
	 * @param userId ID of the user
	 * @param pageable Pagination information
	 * @return Page of DiscussionResponseDTO
	 */
	Page<DiscussionResponseDTO> getResponsesByUser(String userId, Pageable pageable);

	/**
	 * Vote on a response (upvote or downvote).
	 *
	 * @param request DTO containing vote details
	 * @param userId ID of the user voting
	 * @return Updated DiscussionResponseDTO
	 */
	DiscussionResponseDTO voteOnResponse(VoteRequest request, String userId);

	/**
	 * Mark a response as helpful or not helpful.
	 *
	 * @param request DTO containing helpful status
	 * @param userId ID of the user marking the response
	 * @return Updated DiscussionResponseDTO
	 */
	DiscussionResponseDTO markResponseAsHelpful(MarkResponseHelpfulRequest request, String userId);

	/**
	 * Delete a response.
	 *
	 * @param responseId ID of the response to delete
	 * @param userId ID of the user requesting deletion
	 */
	void deleteResponse(String responseId, String userId);
}