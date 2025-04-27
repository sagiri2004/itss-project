package com.example.backend.event;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MessageEvent {
	String content;
	String conversationId;
	String rescueCompanyId;
	String userId;
	String senderType;
	boolean isRead;
	LocalDateTime sentAt;
}
