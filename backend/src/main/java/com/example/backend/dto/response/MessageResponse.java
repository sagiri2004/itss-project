package com.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.example.backend.model.Message;
import com.example.backend.model.enums.MessageSender;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
	private String id;
	private String content;
	private MessageSender senderType;
	private boolean isRead;
	private LocalDateTime sentAt;

	public static MessageResponse fromEntity(Message message) {
		return MessageResponse.builder()
				.id(message.getId())
				.content(message.getContent())
				.senderType(message.getSenderType())
				.isRead(message.isRead())
				.sentAt(message.getSentAt())
				.build();
	}
}
