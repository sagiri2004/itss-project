package com.example.backend.kafka;

import com.example.backend.event.NotificationEvent;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationEventProducer {

	private final KafkaTemplate<String, String> kafkaTemplate;
	private final ObjectMapper objectMapper;

	private static final String TOPIC = "notification-created-topic";

	public void sendNotificationEvent(NotificationEvent event) {
		try {
			String message = objectMapper.writeValueAsString(event);
			kafkaTemplate.send(TOPIC, message);
		} catch (JsonProcessingException e) {
			log.error("❌ Failed to serialize NotificationEvent", e);
		}
	}
}