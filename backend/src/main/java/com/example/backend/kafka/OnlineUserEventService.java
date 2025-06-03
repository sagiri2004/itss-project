package com.example.backend.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class OnlineUserEventService {
	private final KafkaTemplate<String, String> kafkaTemplate;
	private final ObjectMapper objectMapper;

	// Map để lưu trữ các request đang chờ response
	private final ConcurrentMap<String, CompletableFuture<List<String>>> pendingRequests = new ConcurrentHashMap<>();

	public List<String> requestOnlineUsers() {
		String correlationId = UUID.randomUUID().toString();
		CompletableFuture<List<String>> future = new CompletableFuture<>();
		pendingRequests.put(correlationId, future);

		// Gửi request với correlationId cả ở key và value
		String requestJson = String.format("{\"correlationId\":\"%s\"}", correlationId);
		kafkaTemplate.send("get-online-users-request", correlationId, requestJson);

		try {
			// Đợi response tối đa 5s
			return future.get(5, TimeUnit.SECONDS);
		} catch (Exception e) {
			log.error("Timeout or error waiting for online users response", e);
			return List.of();
		} finally {
			pendingRequests.remove(correlationId);
		}
	}

	@KafkaListener(topics = "get-online-users-response", groupId = "backend-get-online-users-group")
	public void handleOnlineUsersResponse(ConsumerRecord<String, String> record) {
		String correlationId = record.key();
		String value = record.value();
		CompletableFuture<List<String>> future = pendingRequests.get(correlationId);
		if (future != null) {
			try {
				List<String> onlineUsers = objectMapper.readValue(value, List.class);
				future.complete(onlineUsers);
			} catch (Exception e) {
				future.completeExceptionally(e);
			}
		} else {
			log.warn("No pending request for correlationId: {}", correlationId);
		}
	}
}