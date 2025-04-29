package com.example.backend.service.impl;

import com.example.backend.dto.request.DiscussionResponseRequest;
import com.example.backend.dto.request.MarkResponseHelpfulRequest;
import com.example.backend.dto.request.VoteRequest;
import com.example.backend.dto.response.DiscussionResponseDTO;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.CommunityDiscussion;
import com.example.backend.model.DiscussionResponse;
import com.example.backend.model.User;
import com.example.backend.repository.CommunityDiscussionRepository;
import com.example.backend.repository.DiscussionResponseRepository;
import com.example.backend.repository.ResponseReportRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.DiscussionResponseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiscussionResponseServiceImpl implements DiscussionResponseService {
	private final DiscussionResponseRepository responseRepository;
	private final CommunityDiscussionRepository discussionRepository;
	private final UserRepository userRepository;
	private final ResponseReportRepository reportRepository;

	@Override
	@Transactional
	public DiscussionResponseDTO addResponse(DiscussionResponseRequest request, String responderId) {
		CommunityDiscussion discussion = discussionRepository.findById(request.getDiscussionId())
				.orElseThrow(() -> new ResourceNotFoundException("Discussion not found"));

		// Check if the discussion is closed
		if (discussion.getIsClosed()) {
			throw new IllegalArgumentException("Cannot respond to a closed discussion");
		}

		User responder = userRepository.findById(responderId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));

		DiscussionResponse response = DiscussionResponse.builder()
				.discussion(discussion)
				.responder(responder)
				.content(request.getContent())
				.build();

		response = responseRepository.save(response);

		return mapToDTO(response, false);
	}

	@Override
	@Transactional(readOnly = true)
	public List<DiscussionResponseDTO> getResponsesByDiscussion(String discussionId, String userId, Boolean sortByVotes) {
		CommunityDiscussion discussion = discussionRepository.findById(discussionId)
				.orElseThrow(() -> new ResourceNotFoundException("Discussion not found"));

		List<DiscussionResponse> responses;
		if (sortByVotes) {
			responses = responseRepository.findByDiscussionOrderByUpvotesDescCreatedAtAsc(discussion);
		} else {
			responses = responseRepository.findByDiscussionOrderByCreatedAtAsc(discussion);
		}

		return responses.stream()
				.map(response -> {
					boolean isReported = false;
					if (userId != null) {
						isReported = reportRepository.existsByDiscussionResponseAndReporter_Id(response, userId);
					}
					return mapToDTO(response, isReported);
				})
				.collect(Collectors.toList());
	}

	@Override
	@Transactional(readOnly = true)
	public Page<DiscussionResponseDTO> getResponsesByUser(String userId, Pageable pageable) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));

		return responseRepository.findByResponderOrderByCreatedAtDesc(user, pageable)
				.map(response -> mapToDTO(response, false));
	}

	@Override
	@Transactional
	public DiscussionResponseDTO voteOnResponse(VoteRequest request, String userId) {
		DiscussionResponse response = responseRepository.findById(request.getResponseId())
				.orElseThrow(() -> new ResourceNotFoundException("Response not found"));

		// Trong hệ thống thực tế, cần lưu danh sách người dùng đã vote
		// Cho ví dụ này, chúng ta chỉ tăng/giảm tổng số lượt vote
		if (request.getIsUpvote()) {
			response.setUpvotes(response.getUpvotes() + 1);
		} else {
			response.setDownvotes(response.getDownvotes() + 1);
		}

		response = responseRepository.save(response);

		return mapToDTO(response, reportRepository.existsByDiscussionResponseAndReporter_Id(response, userId));
	}

	@Override
	@Transactional
	public DiscussionResponseDTO markResponseAsHelpful(MarkResponseHelpfulRequest request, String userId) {
		DiscussionResponse response = responseRepository.findById(request.getResponseId())
				.orElseThrow(() -> new ResourceNotFoundException("Response not found"));

		CommunityDiscussion discussion = response.getDiscussion();

		// Chỉ người tạo thảo luận mới có thể đánh dấu phản hồi là hữu ích
		if (!discussion.getCreator().getId().equals(userId)) {
			throw new IllegalArgumentException("Only the discussion creator can mark responses as helpful");
		}

		response.setIsHelpful(request.getIsHelpful());
		response = responseRepository.save(response);

		return mapToDTO(response, reportRepository.existsByDiscussionResponseAndReporter_Id(response, userId));
	}

	@Override
	@Transactional
	public void deleteResponse(String responseId, String userId) {
		DiscussionResponse response = responseRepository.findById(responseId)
				.orElseThrow(() -> new ResourceNotFoundException("Response not found"));

		// Chỉ người tạo phản hồi mới có thể xóa
		if (!response.getResponder().getId().equals(userId)) {
			throw new IllegalArgumentException("Only the responder can delete this response");
		}

		responseRepository.delete(response);
	}

	private DiscussionResponseDTO mapToDTO(DiscussionResponse response, boolean isReported) {
		return DiscussionResponseDTO.builder()
				.id(response.getId())
				.discussionId(response.getDiscussion().getId())
				.responder(DiscussionResponseDTO.UserSummary.builder()
						.id(response.getResponder().getId())
						.name(response.getResponder().getName())
						.build())
				.content(response.getContent())
				.upvotes(response.getUpvotes())
				.downvotes(response.getDownvotes())
				.isHelpful(response.getIsHelpful())
				.createdAt(response.getCreatedAt())
				.updatedAt(response.getUpdatedAt())
				.isReported(isReported)
				.build();
	}
}