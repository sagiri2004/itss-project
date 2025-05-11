package com.example.backend.controller;

import com.example.backend.dto.request.CommunityDiscussionRequest;
import com.example.backend.dto.request.MarkDiscussionRequest;
import com.example.backend.dto.response.CommunityDiscussionResponse;
import com.example.backend.service.CommunityDiscussionService;
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

@RestController
@RequestMapping("/api/v1/community-discussions")
@RequiredArgsConstructor
public class CommunityDiscussionController {
	private final CommunityDiscussionService discussionService;

	@PostMapping
	@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
	public ResponseEntity<CommunityDiscussionResponse> createDiscussion(
			@Valid @RequestBody CommunityDiscussionRequest request,
			@AuthenticationPrincipal UserDetails userDetails) {
		CommunityDiscussionResponse response = discussionService.createDiscussion(request, userDetails.getUsername());
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@GetMapping
	public ResponseEntity<Page<CommunityDiscussionResponse>> getAllDiscussions(
			@PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
		Page<CommunityDiscussionResponse> discussions = discussionService.getAllDiscussions(pageable);
		return ResponseEntity.ok(discussions);
	}

	@GetMapping("/{discussionId}")
	public ResponseEntity<CommunityDiscussionResponse> getDiscussionById(@PathVariable String discussionId) {
		CommunityDiscussionResponse discussion = discussionService.getDiscussionById(discussionId);
		return ResponseEntity.ok(discussion);
	}

	@GetMapping("/status")
	public ResponseEntity<Page<CommunityDiscussionResponse>> getDiscussionsByStatus(
			@RequestParam(required = false, defaultValue = "false") Boolean isResolved,
			@RequestParam(required = false, defaultValue = "false") Boolean isClosed,
			@PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
		Page<CommunityDiscussionResponse> discussions = discussionService.getDiscussionsByStatus(isResolved, isClosed, pageable);
		return ResponseEntity.ok(discussions);
	}

	@GetMapping("/incident-type/{incidentType}")
	public ResponseEntity<Page<CommunityDiscussionResponse>> getDiscussionsByIncidentType(
			@PathVariable String incidentType,
			@PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
		Page<CommunityDiscussionResponse> discussions = discussionService.getDiscussionsByIncidentType(incidentType, pageable);
		return ResponseEntity.ok(discussions);
	}

	@GetMapping("/user/{userId}")
	public ResponseEntity<Page<CommunityDiscussionResponse>> getDiscussionsByUser(
			@PathVariable String userId,
			@PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
		Page<CommunityDiscussionResponse> discussions = discussionService.getDiscussionsByUser(userId, pageable);
		return ResponseEntity.ok(discussions);
	}

	@GetMapping("/search")
	public ResponseEntity<Page<CommunityDiscussionResponse>> searchDiscussions(
			@RequestParam String keyword,
			@PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
		Page<CommunityDiscussionResponse> discussions = discussionService.searchDiscussions(keyword, pageable);
		return ResponseEntity.ok(discussions);
	}

	@PutMapping("/resolve")
	@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
	public ResponseEntity<CommunityDiscussionResponse> markDiscussionAsResolved(
			@Valid @RequestBody MarkDiscussionRequest request,
			@AuthenticationPrincipal UserDetails userDetails) {
		CommunityDiscussionResponse response = discussionService.markDiscussionAsResolved(request, userDetails.getUsername());
		return ResponseEntity.ok(response);
	}

	@PutMapping("/close")
	@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
	public ResponseEntity<CommunityDiscussionResponse> closeDiscussion(
			@Valid @RequestBody MarkDiscussionRequest request,
			@AuthenticationPrincipal UserDetails userDetails) {
		CommunityDiscussionResponse response = discussionService.closeDiscussion(request, userDetails.getUsername());
		return ResponseEntity.ok(response);
	}
}