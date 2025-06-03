package com.example.notificationservice.event;

import com.example.notificationservice.model.Notification;
import com.example.notificationservice.service.NotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.annotation.RetryableTopic;
import org.springframework.kafka.retrytopic.DltStrategy;
import org.springframework.retry.annotation.Backoff;
import org.springframework.stereotype.Component;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import java.util.concurrent.CompletableFuture;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class EventConsumer {

	private final ObjectMapper objectMapper;
	private final NotificationService notificationService;
	private final KafkaTemplate<String, String> kafkaTemplate;

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

	@KafkaListener(topics = "get-online-users-request", groupId = "notification-service-group")
	public void handleGetOnlineUsersRequest(String message) {
		log.info("=== Starting handleGetOnlineUsersRequest ===");
		try {
			List<String> onlineUsers = notificationService.getAllOnlineUsers();
			log.info("Found online users: {}", onlineUsers);
			
			// Gửi response qua Kafka
			JsonNode root = objectMapper.readTree(message);
			String correlationId = root.has("correlationId") ? root.get("correlationId").asText() : null;
			String response = objectMapper.writeValueAsString(onlineUsers);
			log.info("Preparing to send response: {}", response);
			
			// Sử dụng CompletableFuture để đảm bảo message được gửi
			CompletableFuture<SendResult<String, String>> future = kafkaTemplate.send("get-online-users-response", correlationId, response);
			future.whenComplete((result, ex) -> {
				if (ex == null) {
					log.info("Response sent successfully to partition: {}, offset: {}", 
						result.getRecordMetadata().partition(), 
						result.getRecordMetadata().offset());
				} else {
					log.error("Failed to send response", ex);
				}
			});
			
			// Đợi cho đến khi message được gửi
			future.join();
			log.info("=== Finished handleGetOnlineUsersRequest ===");
		} catch (JsonProcessingException e) {
			log.error("Error serializing online users list", e);
		} catch (Exception e) {
			log.error("Error handling get online users request", e);
		}
	}
}