package com.example.notificationservice.controller;


import com.example.notificationservice.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/notification")
public class NotificationController {

	private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);
	private static final String USER_SESSION_PREFIX = "user:session:";

	@Autowired
	private RedisTemplate<String, Object> redisTemplate;

	@Autowired
	private NotificationService notificationService;

	@PostMapping("/user/{userId}")
	public Map<String, Object> sendNotificationToUser(
			@PathVariable("userId") String userId,
			@RequestBody Map<String, String> request) throws IOException {

		String message = request.get("message");
		notificationService.sendNotificationToUser(userId, message);

		Map<String, Object> response = new HashMap<>();
		response.put("success", true);
		response.put("message", "Notification sent to user: " + userId);
		return response;
	}

	@PostMapping("/all")
	public Map<String, Object> sendNotificationToAllUsers(@RequestBody Map<String, String> request) throws IOException {
		String message = request.get("message");
		Set<String> keys = redisTemplate.keys(USER_SESSION_PREFIX + "*");

		if (keys != null && !keys.isEmpty()) {
			for (String key : keys) {
				String userId = key.substring(USER_SESSION_PREFIX.length());
				notificationService.sendNotificationToUser(userId, message);
			}
		}

		Map<String, Object> response = new HashMap<>();
		response.put("success", true);
		response.put("message", "Notification sent to all online users");
		return response;
	}
}

