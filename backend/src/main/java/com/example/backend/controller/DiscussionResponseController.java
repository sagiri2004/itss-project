package com.example.backend.controller;

import com.example.backend.dto.request.DiscussionResponseRequest;
import com.example.backend.dto.request.MarkResponseHelpfulRequest;
import com.example.backend.dto.request.VoteRequest;
import com.example.backend.dto.response.DiscussionResponseDTO;
import com.example.backend.service.DiscussionResponseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/discussion-responses")
@RequiredArgsConstructor
public class DiscussionResponseController {
	private final DiscussionResponseService responseService;

	@PostMapping
	@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
	public ResponseEntity<DiscussionResponseDTO> addResponse(
			@Valid @RequestBody DiscussionResponseRequest request,
			@AuthenticationPrincipal UserDetails userDetails) {
		DiscussionResponseDTO response = responseService.addResponse(request, userDetails.getUsername());
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@GetMapping("/discussion/{discussionId}")
	public ResponseEntity<List<DiscussionResponseDTO>> getResponsesByDiscussion(
			@PathVariable String discussionId,
			@RequestParam(required = false, defaultValue = "false") Boolean sortByVotes,
			@AuthenticationPrincipal(expression = "username") String userId) {
		List<DiscussionResponseDTO> responses = responseService.getResponsesByDiscussion(discussionId, userId, sortByVotes);
		return ResponseEntity.ok(responses);
	}

	@GetMapping("/user/{userId}")
	public ResponseEntity<Page<DiscussionResponseDTO>> getResponsesByUser(
			@PathVariable String userId,
			@PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
		Page<DiscussionResponseDTO> responses = responseService.getResponsesByUser(userId, pageable);
		return ResponseEntity.ok(responses);
	}

	@PostMapping("/vote")
	@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
	public ResponseEntity<DiscussionResponseDTO> voteOnResponse(
			@Valid @RequestBody VoteRequest request,
			@AuthenticationPrincipal UserDetails userDetails) {
		DiscussionResponseDTO response = responseService.voteOnResponse(request, userDetails.getUsername());
		return ResponseEntity.ok(response);
	}

	@PostMapping("/mark-helpful")
	@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
	public ResponseEntity<DiscussionResponseDTO> markResponseAsHelpful(
			@Valid @RequestBody MarkResponseHelpfulRequest request,
			@AuthenticationPrincipal UserDetails userDetails) {
		DiscussionResponseDTO response = responseService.markResponseAsHelpful(request, userDetails.getUsername());
		return ResponseEntity.ok(response);
	}

	@DeleteMapping("/{responseId}")
	@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
	public ResponseEntity<Void> deleteResponse(
			@PathVariable String responseId,
			@AuthenticationPrincipal UserDetails userDetails) {
		responseService.deleteResponse(responseId, userDetails.getUsername());
		return ResponseEntity.noContent().build();
	}
}