package com.example.notificationservice.configuration;

import com.example.notificationservice.utils.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Slf4j
public class WebSocketHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtUtil jwtUtil;

    public WebSocketHandshakeInterceptor(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        
        log.info("Processing WebSocket handshake request");
        
        if (request instanceof ServletServerHttpRequest) {
            HttpServletRequest servletRequest = ((ServletServerHttpRequest) request).getServletRequest();
            
            String token = servletRequest.getParameter("token");
            log.info("Token from URL parameter: {}", token);
            
            if (token != null && !token.isEmpty()) {
                try {
                    // Xác thực token và lấy userId
                    String userId = jwtUtil.extractUserId(token);
                    
                    if (userId != null) {
                        // Lưu token và userId vào session attributes
                        attributes.put("token", token);
                        attributes.put("userId", userId);
                        log.info("Authenticated websocket connection: userId={}", userId);
                        return true;
                    } else {
                        log.warn("Invalid user ID in token parameter");
                    }
                } catch (Exception e) {
                    log.error("Error processing token from URL parameter", e);
                }
            } else {
                log.warn("No token provided in URL parameter");
            }
        }
        
        // Vẫn cho phép kết nối để STOMP interceptor xử lý phần còn lại
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
    }
}