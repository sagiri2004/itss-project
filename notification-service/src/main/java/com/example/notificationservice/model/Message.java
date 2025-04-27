package com.example.notificationservice.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Message {
	String content;
	String conversationId;
	String rescueCompanyId;
	String userId;
	String senderType;

	@JsonProperty("isRead")
	boolean read;
	LocalDateTime sentAt;
}
