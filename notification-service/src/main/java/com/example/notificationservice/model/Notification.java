package com.example.notificationservice.model;

import com.example.notificationservice.model.enums.NotificationType;
import lombok.*;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Notification implements Serializable {
	String recipientId;
	String title;
	String content;
	NotificationType type;
	LocalDateTime sentAt;
	Map<String, Object> additionalData;
	String conversationId;
}