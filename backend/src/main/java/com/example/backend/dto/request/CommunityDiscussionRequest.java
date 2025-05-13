package com.example.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityDiscussionRequest {
	@NotBlank(message = "Title is required")
	@Size(max = 255, message = "Title must not exceed 255 characters")
	private String title;

	@NotBlank(message = "Content is required")
	@Size(max = 5000, message = "Content must not exceed 5000 characters")
	private String content;

	@NotBlank(message = "Incident type is required")
	private String incidentType;
}