package com.example.notificationservice.event;

import com.example.notificationservice.model.Message;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;


@Slf4j
@Service
@RequiredArgsConstructor
public class MessageProducer {
	private final KafkaTemplate<String, String> kafkaTemplate;
	private final ObjectMapper objectMapper;

	private static final String TOPIC = "chat-message-topic";

	public void sendMessageEvent(Message event) {
		try {
			log.info("📢 Sending message event: {}", event);
			String message = objectMapper.writeValueAsString(event);
			kafkaTemplate.send(TOPIC, message);
		} catch (JsonProcessingException e) {
			log.error("❌ Failed to serialize MessageEvent", e);
		}
	}
}
