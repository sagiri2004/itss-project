package com.example.backend.dto.response;

import com.example.backend.model.Message;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MessageCursorResponse {
	private List<MessageResponse> messages;
	private String nextCursor;

	public static MessageCursorResponse fromEntities(List<Message> messages, String nextCursor) {
		return MessageCursorResponse.builder()
				.messages(messages.stream()
						.map(MessageResponse::fromEntity)
						.collect(Collectors.toList()))
				.nextCursor(nextCursor)
				.build();
	}
}
