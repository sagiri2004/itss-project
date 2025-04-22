package com.example.notificationservice.service;

import com.example.notificationservice.model.Notification;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.data.redis.core.RedisTemplate;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class NotificationService extends TextWebSocketHandler {

	private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
	private static final String USER_SESSION_PREFIX = "user:session:";
	private final RedisTemplate<String, Object> redisTemplate;
	private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

	public NotificationService(RedisTemplate<String, Object> redisTemplate) {
		this.redisTemplate = redisTemplate;
	}

	@Override
	public void afterConnectionEstablished(WebSocketSession session) throws Exception {
		Map<String, Object> attributes = session.getAttributes();
		String userId = (String) attributes.get("userId");

		if (userId != null) {
			String sessionId = session.getId();
			sessions.put(sessionId, session);
			redisTemplate.opsForValue().set(USER_SESSION_PREFIX + userId, sessionId);
			logger.info("User {} connected with session {}", userId, sessionId);
		} else {
			logger.warn("WebSocket connection without userId! Closing session.");
			session.close();
		}
	}

	@Override
	protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
		logger.info("Received message: {}", message.getPayload());
		session.sendMessage(new TextMessage("Server received: " + message.getPayload()));
	}

	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
		String sessionId = session.getId();
		sessions.remove(sessionId);

		redisTemplate.keys(USER_SESSION_PREFIX + "*").forEach(key -> {
			Object value = redisTemplate.opsForValue().get(key);
			if (value != null && value.equals(sessionId)) {
				redisTemplate.delete(key);
			}
		});

		logger.info("User disconnected: {}", sessionId);
	}

	public void sendNotificationToUser(String userId, String message) throws IOException {
		String sessionId = (String) redisTemplate.opsForValue().get(USER_SESSION_PREFIX + userId);
		if (sessionId != null) {
			WebSocketSession session = sessions.get(sessionId);
			if (session != null && session.isOpen()) {
				session.sendMessage(new TextMessage(message));
			}
		}
	}

	public void sendNotificationToUser(Notification notification) throws IOException {
		ObjectMapper objectMapper = new ObjectMapper();
		String notificationJson = objectMapper.writeValueAsString(notification);

		sendNotificationToUser(notification.getUserId(), notificationJson);
	}
}
