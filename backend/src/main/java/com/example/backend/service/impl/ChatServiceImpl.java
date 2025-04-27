package com.example.backend.service.impl;

import com.example.backend.dto.response.ConversationResponse;
import com.example.backend.dto.response.MessageCursorResponse;
import com.example.backend.event.NotificationEvent;
import com.example.backend.event.enums.NotificationType;
import com.example.backend.kafka.NotificationEventProducer;
import com.example.backend.model.Conversation;
import com.example.backend.model.Message;
import com.example.backend.model.RescueCompany;
import com.example.backend.model.User;
import com.example.backend.model.enums.MessageSender;
import com.example.backend.repository.ConversationRepository;
import com.example.backend.repository.MessageRepository;
import com.example.backend.repository.RescueCompanyRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {
	private final MessageRepository messageRepository;
	private final ConversationRepository conversationRepository;
	private final UserRepository userRepository;
	private final RescueCompanyRepository rescueCompanyRepository;
	private final NotificationEventProducer notificationEventProducer;

	@Override
	@Transactional(readOnly = true)
	public MessageCursorResponse getInitialMessages(String conversationId, int limit) {
		Pageable pageable = PageRequest.of(0, limit + 1);
		List<Message> messages = messageRepository.findInitialMessages(conversationId, pageable);

		return processMessages(messages, limit);
	}

	@Override
	@Transactional(readOnly = true)
	public MessageCursorResponse getMessagesBeforeCursor(String conversationId, String cursor, int limit) {
		CursorComponents components = decodeCursor(cursor);

		Pageable pageable = PageRequest.of(0, limit + 1);
		List<Message> messages = messageRepository.findMessagesBeforeCursor(
				conversationId,
				components.timestamp,
				components.messageId,
				pageable);

		return processMessages(messages, limit);
	}

	@Override
	@Transactional
	public void markAllMessagesAsRead(String conversationId, MessageSender senderType) {
		messageRepository.markAllAsRead(conversationId, senderType);
	}

	@Override
	@Transactional
	public Message sendMessage(String userId, String rescueCompanyId, String content, MessageSender senderType) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new RuntimeException("User not found"));

		RescueCompany company = rescueCompanyRepository.findById(rescueCompanyId)
				.orElseThrow(() -> new RuntimeException("Rescue company not found"));

		// Tìm hoặc tạo cuộc hội thoại
		Conversation conversation = conversationRepository
				.findByUserIdAndRescueCompanyId(userId, rescueCompanyId)
				.orElseGet(() -> {
					Conversation newConversation = Conversation.builder()
							.user(user)
							.rescueCompany(company)
							.build();
					return conversationRepository.save(newConversation);
				});

		// Tạo tin nhắn mới
		Message message = Message.builder()
				.content(content)
				.conversation(conversation)
				.senderType(senderType)
				.isRead(false)
				.build();

		message = messageRepository.save(message);

		// Gửi thông báo qua Kafka
		sendChatNotification(message);

		return message;
	}

	@Override
	@Transactional(readOnly = true)
	public List<ConversationResponse> getUserConversations(String userId) {
		List<Conversation> conversations = conversationRepository.findByUserIdOrderByUpdatedAtDesc(userId);
		return conversations.stream()
				.map(conversation -> mapToConversationResponse(conversation, MessageSender.RESCUE_COMPANY))
				.collect(Collectors.toList());
	}

	@Override
	@Transactional(readOnly = true)
	public List<ConversationResponse> getCompanyConversations(String rescueCompanyId) {
		List<Conversation> conversations = conversationRepository.findByRescueCompanyIdOrderByUpdatedAtDesc(rescueCompanyId);
		return conversations.stream()
				.map(conversation -> mapToConversationResponse(conversation, MessageSender.USER))
				.collect(Collectors.toList());
	}

	private MessageCursorResponse processMessages(List<Message> messages, int limit) {
		boolean hasMoreMessages = messages.size() > limit;

		if (hasMoreMessages) {
			messages = messages.subList(0, limit);
		}

		String nextCursor = null;
		if (hasMoreMessages && !messages.isEmpty()) {
			Message lastMessage = messages.get(messages.size() - 1);
			nextCursor = encodeCursor(lastMessage);
		}

		// Đảo ngược để hiển thị theo thứ tự thời gian
		Collections.reverse(messages);

		return MessageCursorResponse.fromEntities(messages, nextCursor);
	}

	private ConversationResponse mapToConversationResponse(Conversation conversation, MessageSender unreadSenderType) {
		// Số tin nhắn chưa đọc
		long unreadCount = messageRepository.countUnreadMessages(conversation.getId(), unreadSenderType);

		// Lấy tin nhắn mới nhất
		Pageable pageable = PageRequest.of(0, 1);
		List<Message> lastMessages = messageRepository.findInitialMessages(conversation.getId(), pageable);

		ConversationResponse.MessageSummaryResponse lastMessageSummary = null;
		if (!lastMessages.isEmpty()) {
			Message lastMessage = lastMessages.get(0);
			lastMessageSummary = ConversationResponse.MessageSummaryResponse.builder()
					.id(lastMessage.getId())
					.content(lastMessage.getContent())
					.senderType(lastMessage.getSenderType())
					.sentAt(lastMessage.getSentAt())
					.build();
		}

		return ConversationResponse.builder()
				.id(conversation.getId())
				.user(ConversationResponse.UserSummaryResponse.builder()
						.id(conversation.getUser().getId())
						.name(conversation.getUser().getName())
						.build())
				.company(ConversationResponse.RescueCompanySummaryResponse.builder()
						.id(conversation.getRescueCompany().getId())
						.name(conversation.getRescueCompany().getName())
						.build())
				.lastMessage(lastMessageSummary)
				.unreadCount((int) unreadCount)
				.updatedAt(conversation.getUpdatedAt())
				.build();
	}

	private String encodeCursor(Message message) {
		String raw = message.getSentAt() + ":" + message.getId();
		return Base64.getEncoder().encodeToString(raw.getBytes());
	}

	private CursorComponents decodeCursor(String cursor) {
		String decoded = new String(Base64.getDecoder().decode(cursor));
		String[] parts = decoded.split(":");

		return new CursorComponents(
				LocalDateTime.parse(parts[0]),
				parts[1]
		);
	}

	private void sendChatNotification(Message message) {
		String recipientId;
		String title;
		String content;

		if (message.getSenderType() == MessageSender.USER) {
			// Thông báo đến rescue company
			recipientId = message.getConversation().getRescueCompany().getUser().getId();
			title = "Tin nhắn mới từ " + message.getConversation().getUser().getName();
			content = message.getContent();
		} else {
			// Thông báo đến user
			recipientId = message.getConversation().getUser().getId();
			title = "Tin nhắn mới từ " + message.getConversation().getRescueCompany().getName();
			content = message.getContent();
		}

		notificationEventProducer.sendNotificationEvent(
				NotificationEvent.builder()
						.recipientId(recipientId)  // You need to set the recipientId appropriately
						.title(title)
						.content(content)
						.type(NotificationType.CHAT)
						.sentAt(LocalDateTime.now())
						.build()
		);

	}

	private static class CursorComponents {
		private final LocalDateTime timestamp;
		private final String messageId;

		public CursorComponents(LocalDateTime timestamp, String messageId) {
			this.timestamp = timestamp;
			this.messageId = messageId;
		}
	}
}