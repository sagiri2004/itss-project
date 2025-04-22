package com.example.notificationservice.configuration;

import com.example.notificationservice.service.NotificationService;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.*;


@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

	private final NotificationService notificationService;

	public WebSocketConfig(NotificationService notificationService) {
		this.notificationService = notificationService;
	}

	@Override
	public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
		registry.addHandler(notificationService, "/ws/notifications")
				.setAllowedOrigins("*")
				.addInterceptors(new WebSocketHandshakeInterceptor());
	}
}