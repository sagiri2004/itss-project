package com.example.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarkDiscussionRequest {
	@NotNull(message = "Discussion ID is required")
	private String discussionId;

	@NotNull(message = "Status value is required")
	private Boolean status;
}