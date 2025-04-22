package com.example.backend.event;

import lombok.Data;

import java.io.Serializable;

@Data
public class NotificationEvent implements Serializable {
	private String userId;
	private String title;
	private String content;
	private String type;
}