package com.example.backend.dto.response;

import com.example.backend.model.enums.MessageSender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationResponse {
	private String id;
	private UserSummaryResponse user;
	private RescueCompanySummaryResponse company;
	private MessageSummaryResponse lastMessage;
	private int unreadCount;
	private LocalDateTime updatedAt;

	@Data
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	public static class UserSummaryResponse {
		private String id;
		private String name;
	}

	@Data
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	public static class RescueCompanySummaryResponse {
		private String id;
		private String name;
	}

	@Data
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	public static class MessageSummaryResponse {
		private String id;
		private String content;
		private MessageSender senderType;
		private LocalDateTime sentAt;
	}
}