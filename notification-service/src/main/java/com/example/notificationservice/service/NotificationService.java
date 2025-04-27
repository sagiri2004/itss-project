package com.example.notificationservice.service;

import com.example.notificationservice.model.Notification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class NotificationService {

    private static final String USER_SESSION_PREFIX = "user:session:";

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Gửi thông báo văn bản đơn giản đến người dùng cụ thể
     */
    public void sendNotificationToUser(String userId, String message) {
        log.info("Sending text notification to user: {}", userId);

        // Kiểm tra xem người dùng có online không
        String sessionId = (String) redisTemplate.opsForValue().get(USER_SESSION_PREFIX + userId);

        if (sessionId != null) {
            // Sử dụng STOMP để gửi tin nhắn - convertAndSendToUser sẽ tự tìm người dùng dựa trên Principal
            messagingTemplate.convertAndSendToUser(userId, "/queue/notifications", message);
            log.info("Notification sent to user: {}", userId);
        } else {
            log.warn("User {} is not connected, cannot send notification", userId);
        }
    }

    /**
     * Gửi thông báo dạng object đến người dùng cụ thể
     */
    public void sendNotificationToUser(Notification notification) {
        String userId = notification.getRecipientId();
        log.info("Sending structured notification to user: {}", userId);

        // Kiểm tra xem người dùng có online không
        String sessionId = (String) redisTemplate.opsForValue().get(USER_SESSION_PREFIX + userId);

        if (sessionId != null) {
            // Sử dụng STOMP để gửi tin nhắn
            messagingTemplate.convertAndSendToUser(userId, "/queue/notifications", notification);
            log.info("Notification sent to user: {}", userId);
        } else {
            log.warn("User {} is not connected, cannot send notification", userId);
        }
    }

    /**
     * Gửi thông báo đến tất cả người dùng
     */
    public void sendNotificationToAll(String message) {
        log.info("Broadcasting notification to all users");
        messagingTemplate.convertAndSend("/topic/public", message);
    }
}