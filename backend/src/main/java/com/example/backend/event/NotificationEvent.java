package com.example.backend.event;

import com.example.backend.event.enums.NotificationType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationEvent implements Serializable {
	String recipientId;
	String title;
	String content;
	NotificationType type;
	LocalDateTime sentAt;
	Map<String, Object> additionalData;
	String conversationId;
}