package com.example.backend.event;

import lombok.Builder;
import lombok.Data;

import java.io.Serializable;

@Data
@Builder
public class NotificationEvent implements Serializable {
	private String userId;
	private String title;
	private String content;
	private String type;
}