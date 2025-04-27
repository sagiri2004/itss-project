package com.example.notificationservice.event;

import com.example.notificationservice.model.Notification;
import com.example.notificationservice.service.NotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.annotation.RetryableTopic;
import org.springframework.kafka.retrytopic.DltStrategy;
import org.springframework.retry.annotation.Backoff;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class EventConsumer {

	private final ObjectMapper objectMapper;
	private final NotificationService notificationService;

	@RetryableTopic(
			attempts = "4",
			backoff = @Backoff(delay = 1000, multiplier = 2),
			autoCreateTopics = "true",
			dltStrategy = DltStrategy.FAIL_ON_ERROR,
			include = {Exception.class}
	)
	@KafkaListener(
			topics = "notification-created-topic",
			containerFactory = "kafkaListenerContainerFactory",
			groupId = "notification-service-group"
	)
	public void listen(String message) {
		try {
			Notification notification = objectMapper.readValue(message, Notification.class);
//
//			// Gửi thông báo qua WebSocket
			notificationService.sendNotificationToUser(notification);
			log.info("Notification sent to user: {}", notification);
		} catch (Exception e) {
			log.error("Error processing notification", e);
		}
	}
}