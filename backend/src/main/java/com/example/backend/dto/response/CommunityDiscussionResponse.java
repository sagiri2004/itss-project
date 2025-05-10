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
public class CommunityDiscussionResponse {
	private String id;
	private String title;
	private String content;
	private String incidentType;
	private UserSummary creator;
	private Boolean isResolved;
	private Boolean isClosed;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	private Long responseCount;

	@Data
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	public static class UserSummary {
		private String id;
		private String name;
	}
}