package com.example.backend.model;

import com.example.backend.model.enums.MessageSender;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Message {
	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	String id;

	@Column(nullable = false, columnDefinition = "TEXT")
	String content;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "conversation_id")
	Conversation conversation;

	@Enumerated(EnumType.STRING)
	MessageSender senderType;

	boolean isRead;

	@CreationTimestamp
	LocalDateTime sentAt;
}