package com.example.notificationservice.configuration;

import com.example.notificationservice.utils.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;

@Slf4j
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    private static final String USER_SESSION_PREFIX = "user:session:";
    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, Object> redisTemplate;

    public WebSocketConfig(JwtUtil jwtUtil, RedisTemplate<String, Object> redisTemplate) {
        this.jwtUtil = jwtUtil;
        this.redisTemplate = redisTemplate;
        log.info("WebSocketConfig initialized");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .addInterceptors(new WebSocketHandshakeInterceptor(jwtUtil)); // Thêm interceptor
        log.info("STOMP endpoint '/ws' registered with handshake interceptor");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
        log.info("Message broker configured");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    log.info("Processing STOMP CONNECT command");
                    
                    // 1. Lấy token từ STOMP header
                    String token = accessor.getFirstNativeHeader("token");
                    log.debug("Token from STOMP header: {}", token);
                    
                    // 2. Nếu không có token trong header, kiểm tra từ session attributes (được thiết lập bởi handshake interceptor)
                    if (token == null || token.isEmpty()) {
                        Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
                        if (sessionAttributes != null) {
                            token = (String) sessionAttributes.get("token");
                            log.debug("Token from session attributes: {}", token);
                            
                            // Nếu đã có userId trong session (được thiết lập bởi handshake interceptor)
                            String userIdFromSession = (String) sessionAttributes.get("userId");
                            if (userIdFromSession != null) {
                                log.info("Found userId in session: {}", userIdFromSession);
                                
                                accessor.setUser(new Principal() {
                                    @Override
                                    public String getName() {
                                        return userIdFromSession;
                                    }
                                    
                                    @Override
                                    public String toString() {
                                        return "UserPrincipal [name=" + userIdFromSession + "]";
                                    }
                                });
                                
                                // Lưu session vào Redis
                                String sessionId = accessor.getSessionId();
                                redisTemplate.opsForValue().set(USER_SESSION_PREFIX + userIdFromSession, sessionId);
                                log.info("User connected: userId={}, sessionId={}", userIdFromSession, sessionId);
                                
                                return message;
                            }
                        }
                    }
                    
                    // 3. Xử lý token nếu có
                    if (token != null && !token.isEmpty()) {
                        try {
                            String userId = jwtUtil.extractUserId(token);
                            if (userId != null) {
                                // Thiết lập Principal cho Spring Security và message routing
                                accessor.setUser(new Principal() {
                                    @Override
                                    public String getName() {
                                        return userId;
                                    }

                                    @Override
                                    public String toString() {
                                        return "UserPrincipal [name=" + userId + "]";
                                    }
                                });

                                // Lưu session vào Redis
                                String sessionId = accessor.getSessionId();
                                redisTemplate.opsForValue().set(USER_SESSION_PREFIX + userId, sessionId);
                                log.info("User connected from token: userId={}, sessionId={}", userId, sessionId);
                            } else {
                                log.warn("Invalid user ID in token");
                                return null; // Hủy kết nối nếu token không hợp lệ
                            }
                        } catch (Exception e) {
                            log.error("Error processing token", e);
                            return null; // Hủy kết nối nếu có lỗi xảy ra
                        }
                    } else {
                        log.warn("No token provided for STOMP connection");
                        return null; // Hủy kết nối nếu không có token
                    }
                }

                return message;
            }
        });

        log.info("Configured client inbound channel with token handling");
    }
}