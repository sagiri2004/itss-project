package com.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiscussionResponseDTO {
	private String id;
	private String discussionId;
	private UserSummary responder;
	private String content;
	private Integer upvotes;
	private Integer downvotes;
	private Boolean isHelpful;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	private Boolean isReported;

	@Data
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	public static class UserSummary {
		private String id;
		private String name;
	}
}