package com.example.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiscussionResponseRequest {
	@NotNull(message = "Discussion ID is required")
	private String discussionId;

	@NotBlank(message = "Content is required")
	@Size(max = 3000, message = "Content must not exceed 3000 characters")
	private String content;
}