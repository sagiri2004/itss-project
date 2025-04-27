package com.example.notificationservice.configuration;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@Slf4j
public class WebSocketDisconnectHandler {
    private static final String USER_SESSION_PREFIX = "user:session:";
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        
        log.info("User disconnected: sessionId={}", sessionId);
        
        // Xóa session từ Redis
        for (String key : redisTemplate.keys(USER_SESSION_PREFIX + "*")) {
            String storedSessionId = (String) redisTemplate.opsForValue().get(key);
            if (sessionId.equals(storedSessionId)) {
                String userId = key.substring(USER_SESSION_PREFIX.length());
                log.info("Removing session for user: {}", userId);
                redisTemplate.delete(key);
                break;
            }
        }
    }
}