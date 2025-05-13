package com.example.backend.service.impl;

import com.example.backend.dto.request.CommunityDiscussionRequest;
import com.example.backend.dto.request.MarkDiscussionRequest;
import com.example.backend.dto.response.CommunityDiscussionResponse;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.CommunityDiscussion;
import com.example.backend.model.User;
import com.example.backend.repository.CommunityDiscussionRepository;
import com.example.backend.repository.DiscussionResponseRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.CommunityDiscussionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CommunityDiscussionServiceImpl implements CommunityDiscussionService {
	private final CommunityDiscussionRepository discussionRepository;
	private final DiscussionResponseRepository responseRepository;
	private final UserRepository userRepository;

	@Override
	@Transactional
	public CommunityDiscussionResponse createDiscussion(CommunityDiscussionRequest request, String creatorId) {
		User creator = userRepository.findById(creatorId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));

		CommunityDiscussion discussion = CommunityDiscussion.builder()
				.title(request.getTitle())
				.content(request.getContent())
				.incidentType(request.getIncidentType())
				.creator(creator)
				.isResolved(false)
				.isClosed(false)
				.build();

		discussion = discussionRepository.save(discussion);

		return mapToResponse(discussion, 0L);
	}

	@Override
	@Transactional(readOnly = true)
	public Page<CommunityDiscussionResponse> getAllDiscussions(Pageable pageable) {
		return discussionRepository.findByOrderByCreatedAtDesc(pageable)
				.map(discussion -> {
					long responseCount = responseRepository.countByDiscussion(discussion);
					return mapToResponse(discussion, responseCount);
				});
	}

	@Override
	@Transactional(readOnly = true)
	public CommunityDiscussionResponse getDiscussionById(String discussionId) {
		CommunityDiscussion discussion = discussionRepository.findById(discussionId)
				.orElseThrow(() -> new ResourceNotFoundException("Discussion not found"));

		long responseCount = responseRepository.countByDiscussion(discussion);

		return mapToResponse(discussion, responseCount);
	}

	@Override
	@Transactional(readOnly = true)
	public Page<CommunityDiscussionResponse> getDiscussionsByStatus(Boolean isResolved, Boolean isClosed, Pageable pageable) {
		return discussionRepository.findByIsResolvedAndIsClosedOrderByCreatedAtDesc(isResolved, isClosed, pageable)
				.map(discussion -> {
					long responseCount = responseRepository.countByDiscussion(discussion);
					return mapToResponse(discussion, responseCount);
				});
	}

	@Override
	@Transactional(readOnly = true)
	public Page<CommunityDiscussionResponse> getDiscussionsByIncidentType(String incidentType, Pageable pageable) {
		return discussionRepository.findByIncidentTypeOrderByCreatedAtDesc(incidentType, pageable)
				.map(discussion -> {
					long responseCount = responseRepository.countByDiscussion(discussion);
					return mapToResponse(discussion, responseCount);
				});
	}

	@Override
	@Transactional(readOnly = true)
	public Page<CommunityDiscussionResponse> getDiscussionsByUser(String userId, Pageable pageable) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));

		return discussionRepository.findByCreatorOrderByCreatedAtDesc(user, pageable)
				.map(discussion -> {
					long responseCount = responseRepository.countByDiscussion(discussion);
					return mapToResponse(discussion, responseCount);
				});
	}

	@Override
	@Transactional(readOnly = true)
	public Page<CommunityDiscussionResponse> searchDiscussions(String keyword, Pageable pageable) {
		return discussionRepository.searchByKeyword(keyword, pageable)
				.map(discussion -> {
					long responseCount = responseRepository.countByDiscussion(discussion);
					return mapToResponse(discussion, responseCount);
				});
	}

	@Override
	@Transactional
	public CommunityDiscussionResponse markDiscussionAsResolved(MarkDiscussionRequest request, String userId) {
		CommunityDiscussion discussion = discussionRepository.findById(request.getDiscussionId())
				.orElseThrow(() -> new ResourceNotFoundException("Discussion not found"));

		// Verify that the user is the creator of the discussion
		if (!discussion.getCreator().getId().equals(userId)) {
			throw new IllegalArgumentException("Only the creator can mark a discussion as resolved");
		}

		discussion.setIsResolved(request.getStatus());
		discussion = discussionRepository.save(discussion);

		long responseCount = responseRepository.countByDiscussion(discussion);

		return mapToResponse(discussion, responseCount);
	}

	@Override
	@Transactional
	public CommunityDiscussionResponse closeDiscussion(MarkDiscussionRequest request, String userId) {
		CommunityDiscussion discussion = discussionRepository.findById(request.getDiscussionId())
				.orElseThrow(() -> new ResourceNotFoundException("Discussion not found"));

		// Verify that the user is the creator of the discussion
		if (!discussion.getCreator().getId().equals(userId)) {
			throw new IllegalArgumentException("Only the creator can close a discussion");
		}

		discussion.setIsClosed(request.getStatus());
		discussion = discussionRepository.save(discussion);

		long responseCount = responseRepository.countByDiscussion(discussion);

		return mapToResponse(discussion, responseCount);
	}

	private CommunityDiscussionResponse mapToResponse(CommunityDiscussion discussion, Long responseCount) {
		return CommunityDiscussionResponse.builder()
				.id(discussion.getId())
				.title(discussion.getTitle())
				.content(discussion.getContent())
				.incidentType(discussion.getIncidentType())
				.creator(CommunityDiscussionResponse.UserSummary.builder()
						.id(discussion.getCreator().getId())
						.name(discussion.getCreator().getName())
						.build())
				.isResolved(discussion.getIsResolved())
				.isClosed(discussion.getIsClosed())
				.createdAt(discussion.getCreatedAt())
				.updatedAt(discussion.getUpdatedAt())
				.responseCount(responseCount)
				.build();
	}
}