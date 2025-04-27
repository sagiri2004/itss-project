package com.example.notificationservice.configuration;

import com.example.notificationservice.utils.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Slf4j
public class StompChannelInterceptor implements ChannelInterceptor {
    
    private final JwtUtil jwtUtil;
    
    public StompChannelInterceptor(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }
    
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            log.info("Processing STOMP CONNECT command");
            
            // Lấy token từ header
            String token = accessor.getFirstNativeHeader("token");
            log.info("Token in STOMP CONNECT: {}", token);
            
            // Nếu không có token trong header STOMP, kiểm tra sessionAttributes của WebSocket
            if (token == null) {
                Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
                if (sessionAttributes != null) {
                    String userIdFromSession = (String) sessionAttributes.get("userId");
                    if (userIdFromSession != null) {
                        log.info("Found userId in WebSocket session: {}", userIdFromSession);
                        
                        // Thiết lập Principal
                        accessor.setUser(new UserPrincipal(userIdFromSession));
                        log.info("Set Principal for STOMP session: {}", userIdFromSession);
                        
                        // Lưu userId vào sessionAttributes của STOMP để sử dụng sau này
                        sessionAttributes.put("stompUserId", userIdFromSession);
                    }
                } else {
                    log.warn("No session attributes available in STOMP CONNECT");
                }
            } else {
                // Trích xuất userId từ token
                String userId = jwtUtil.extractUserId(token);
                if (userId != null) {
                    log.info("Extracted userId from token: {}", userId);
                    
                    // Thiết lập Principal
                    accessor.setUser(new UserPrincipal(userId));
                    
                    // Đảm bảo sessionAttributes tồn tại
                    Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
                    if (sessionAttributes == null) {
                        sessionAttributes = new HashMap<>();
                        accessor.setSessionAttributes(sessionAttributes);
                    }
                    
                    // Lưu userId vào sessionAttributes
                    sessionAttributes.put("userId", userId);
                    sessionAttributes.put("stompUserId", userId);
                    
                    log.info("Set userId in STOMP session attributes: {}", userId);
                }
            }
        }
        
        return message;
    }
}