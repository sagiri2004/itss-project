package com.example.backend.kafka;

import com.example.backend.event.MessageEvent;
import com.example.backend.model.Message;
import com.example.backend.model.enums.MessageSender;
import com.example.backend.service.ChatService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.annotation.RetryableTopic;
import org.springframework.kafka.retrytopic.DltStrategy;
import org.springframework.retry.annotation.Backoff;
import org.springframework.stereotype.Component;

/**
 * Consumer để lắng nghe và xử lý các sự kiện chat từ notification service
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class MessageEventConsumer {

	private final ObjectMapper objectMapper;
	private final ChatService chatService;

	/**
	 * Phương thức lắng nghe sự kiện tin nhắn chat mới từ Kafka.
	 * Sử dụng RetryableTopic để tự động thử lại khi xảy ra lỗi.
	 *
	 * @param message Tin nhắn dạng chuỗi JSON nhận được từ Kafka
	 */
	@RetryableTopic(
			attempts = "4",
			backoff = @Backoff(delay = 1000, multiplier = 2),
			autoCreateTopics = "true",
			dltStrategy = DltStrategy.FAIL_ON_ERROR,
			include = {Exception.class}
	)
	@KafkaListener(
			topics = "chat-message-topic",
			containerFactory = "kafkaListenerContainerFactory",
			groupId = "chat-service-group"
	)
	public void consumeNewChatMessage(String message) {
		try {
			log.info("Received new chat message: {}", message);
			MessageEvent chatMessage = objectMapper.readValue(message, MessageEvent.class);
			handleChatMessage(chatMessage);
		} catch (Exception e) {
			log.error("Error processing chat message: ", e);
			throw new RuntimeException("Failed to process chat message", e);
		}
	}

	/**
	 * Xử lý tin nhắn chat sau khi nhận từ Kafka
	 *
	 * @param chatMessage Đối tượng Message được deserialized từ JSON
	 */
	private void handleChatMessage(MessageEvent chatMessage) {
		log.debug("Processing chat message: {}", chatMessage);

		chatService.sendMessage(
				chatMessage.getUserId(),
				chatMessage.getRescueCompanyId(),
				chatMessage.getContent(),
				MessageSender.valueOf(chatMessage.getSenderType())
		);
	}
}