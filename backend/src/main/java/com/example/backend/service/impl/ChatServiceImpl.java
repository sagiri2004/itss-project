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

/**
 * Implementation of the ChatService interface.
 * Provides business logic for managing conversations, messages, and unread message counts.
 */
@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

	private final MessageRepository messageRepository;
	private final ConversationRepository conversationRepository;
	private final UserRepository userRepository;
	private final RescueCompanyRepository rescueCompanyRepository;
	private final NotificationEventProducer notificationEventProducer;

	/**
	 * {@inheritDoc}
	 */
	@Override
	@Transactional(readOnly = true)
	public MessageCursorResponse getInitialMessages(String conversationId, int limit, String sort) {
		// Determine sort direction
		Sort sortOrder = sort.equalsIgnoreCase("asc") ? Sort.by("sentAt").ascending() : Sort.by("sentAt").descending();
		Pageable pageable = PageRequest.of(0, limit + 1, sortOrder);

		// Fetch initial messages
		List<Message> messages = messageRepository.findInitialMessages(conversationId, pageable);

		return processMessages(messages, limit, sort);
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	@Transactional(readOnly = true)
	public MessageCursorResponse getMessagesBeforeCursor(String conversationId, String cursor, int limit, String sort) {
		CursorComponents components = decodeCursor(cursor);

		// Determine sort direction
		Sort sortOrder = sort.equalsIgnoreCase("asc") ? Sort.by("sentAt").ascending() : Sort.by("sentAt").descending();
		Pageable pageable = PageRequest.of(0, limit + 1, sortOrder);

		// Fetch messages before the cursor
		List<Message> messages = messageRepository.findMessagesBeforeCursor(
				conversationId,
				components.timestamp,
				components.messageId,
				pageable);

		return processMessages(messages, limit, sort);
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	@Transactional
	public void markAllMessagesAsRead(String conversationId, MessageSender senderType) {
		// Update all unread messages from the specified sender to read
		messageRepository.markAllAsRead(conversationId, senderType);
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	@Transactional
	public Message sendMessage(String userId, String rescueCompanyId, String content, MessageSender senderType) {
		// Validate user and rescue company
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
		RescueCompany company = rescueCompanyRepository.findById(rescueCompanyId)
				.orElseThrow(() -> new RuntimeException("Rescue company not found with ID: " + rescueCompanyId));

		// Find or create a conversation
		Conversation conversation = conversationRepository
				.findByUserIdAndRescueCompanyId(userId, rescueCompanyId)
				.orElseGet(() -> {
					Conversation newConversation = Conversation.builder()
							.user(user)
							.rescueCompany(company)
							.updatedAt(LocalDateTime.now())
							.build();
					return conversationRepository.save(newConversation);
				});

		// Create and save the new message
		Message message = Message.builder()
				.content(content)
				.conversation(conversation)
				.senderType(senderType)
				.isRead(false)
				.sentAt(LocalDateTime.now())
				.build();

		message = messageRepository.save(message);

		// Update conversation's last updated timestamp
		conversation.setUpdatedAt(LocalDateTime.now());
		conversationRepository.save(conversation);

		// Send notification via Kafka
		sendChatNotification(message);

		return message;
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	@Transactional(readOnly = true)
	public List<ConversationResponse> getUserConversations(String userId) {
		// Fetch conversations for the user, sorted by last updated
		List<Conversation> conversations = conversationRepository.findByUserIdOrderByUpdatedAtDesc(userId);
		return conversations.stream()
				.map(conversation -> mapToConversationResponse(conversation, MessageSender.RESCUE_COMPANY))
				.collect(Collectors.toList());
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	@Transactional(readOnly = true)
	public List<ConversationResponse> getCompanyConversations(String rescueCompanyId) {
		// Fetch conversations for the rescue company, sorted by last updated
		List<Conversation> conversations = conversationRepository.findByRescueCompanyIdOrderByUpdatedAtDesc(rescueCompanyId);
		return conversations.stream()
				.map(conversation -> mapToConversationResponse(conversation, MessageSender.USER))
				.collect(Collectors.toList());
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	@Transactional(readOnly = true)
	public ConversationResponse getConversationById(String conversationId) {
		// Fetch the conversation by ID
		Conversation conversation = conversationRepository.findById(conversationId)
				.orElseThrow(() -> new RuntimeException("Conversation not found with ID: " + conversationId));

		// Map to response, counting unread messages from the opposite sender
		return mapToConversationResponse(conversation, conversation.getUser() != null ? MessageSender.RESCUE_COMPANY : MessageSender.USER);
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	@Transactional(readOnly = true)
	public long countTotalUnreadMessagesForUser(String userId) {
		// Count unread messages from rescue companies across all user conversations
		return messageRepository.countTotalUnreadMessagesForUser(userId, MessageSender.RESCUE_COMPANY);
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	@Transactional(readOnly = true)
	public long countTotalUnreadMessagesForCompany(String rescueCompanyId) {
		// Count unread messages from users across all company conversations
		return messageRepository.countTotalUnreadMessagesForCompany(rescueCompanyId, MessageSender.USER);
	}

	/**
	 * Processes a list of messages for pagination, generating a cursor if more messages are available.
	 *
	 * @param messages The list of messages retrieved.
	 * @param limit    The maximum number of messages to return.
	 * @param sort     The sort order (asc/desc).
	 * @return MessageCursorResponse containing the messages and next cursor.
	 */
	private MessageCursorResponse processMessages(List<Message> messages, int limit, String sort) {
		boolean hasMoreMessages = messages.size() > limit;

		// Trim the list if we fetched more than the limit
		if (hasMoreMessages) {
			messages = messages.subList(0, limit);
		}

		// Generate the next cursor if there are more messages
		String nextCursor = null;
		if (hasMoreMessages && !messages.isEmpty()) {
			Message lastMessage = messages.get(messages.size() - 1);
			nextCursor = encodeCursor(lastMessage);
		}

		// Reverse messages if sorting descending to show newest first
		if (sort.equalsIgnoreCase("desc")) {
			Collections.reverse(messages);
		}

		return MessageCursorResponse.fromEntities(messages, nextCursor);
	}

	/**
	 * Maps a Conversation entity to a ConversationResponse DTO.
	 *
	 * @param conversation      The conversation entity.
	 * @param unreadSenderType  The sender type to count unread messages for.
	 * @return ConversationResponse containing conversation details.
	 */
	private ConversationResponse mapToConversationResponse(Conversation conversation, MessageSender unreadSenderType) {
		// Count unread messages
		long unreadCount = messageRepository.countUnreadMessages(conversation.getId(), unreadSenderType);

		// Fetch the latest message
		Pageable pageable = PageRequest.of(0, 1, Sort.by("sentAt").descending());
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

		// Build the response
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
				.hasUnreadMessages(unreadCount > 0) // New field to indicate if there are unread messages
				.updatedAt(conversation.getUpdatedAt())
				.build();
	}

	/**
	 * Encodes a message into a cursor string for pagination.
	 *
	 * @param message The message to encode.
	 * @return The encoded cursor string.
	 */
	private String encodeCursor(Message message) {
		String raw = message.getSentAt() + ":" + message.getId();
		return Base64.getEncoder().encodeToString(raw.getBytes());
	}

	/**
	 * Decodes a cursor string into its components.
	 *
	 * @param cursor The cursor string to decode.
	 * @return CursorComponents containing timestamp and message ID.
	 * @throws IllegalArgumentException if the cursor is invalid.
	 */
	private CursorComponents decodeCursor(String cursor) {
		try {
			String decoded = new String(Base64.getDecoder().decode(cursor));
			String[] parts = decoded.split(":");

			if (parts.length != 2) {
				throw new IllegalArgumentException("Invalid cursor format");
			}

			return new CursorComponents(
					LocalDateTime.parse(parts[0]),
					parts[1]
			);
		} catch (Exception e) {
			throw new IllegalArgumentException("Invalid cursor: " + cursor, e);
		}
	}

	/**
	 * Sends a notification for a new chat message via Kafka.
	 *
	 * @param message The message to notify about.
	 */
	private void sendChatNotification(Message message) {
		// Kiểm tra message và các trường liên quan để tránh null
		if (message == null) {
			throw new IllegalArgumentException("Message must not be null");
		}
		if (message.getConversation() == null) {
			throw new IllegalArgumentException("Conversation must not be null");
		}
		if (message.getSenderType() == null) {
			throw new IllegalArgumentException("SenderType must not be null");
		}

		String recipientId;
		String title;
		String content;
		String conversationId = message.getConversation().getId();
		String rescueCompanyId;
		String userId = message.getConversation().getUser().getId();
		String senderType = message.getSenderType().name();
		boolean isRead = message.isRead();

		// Lấy rescueCompanyId và kiểm tra null
		if (message.getConversation().getRescueCompany() == null) {
			throw new IllegalArgumentException("RescueCompany must not be null");
		}
		rescueCompanyId = message.getConversation().getRescueCompany().getId();

		if (message.getSenderType() == MessageSender.USER) {
			// Notify the rescue company
			if (message.getConversation().getRescueCompany().getUser() == null) {
				throw new IllegalArgumentException("RescueCompany user must not be null");
			}
			recipientId = message.getConversation().getRescueCompany().getUser().getId();
			title = "Tin nhắn mới từ " + message.getConversation().getUser().getName();
			content = message.getContent();
		} else {
			// Notify the user
			recipientId = message.getConversation().getUser().getId();
			title = "Tin nhắn mới từ " + message.getConversation().getRescueCompany().getName();
			content = message.getContent();
		}

		NotificationEvent notificationEvent = NotificationEvent.builder()
				.recipientId(recipientId)
				.title(title)
				.content(content)
				.type(NotificationType.CHAT)
				.sentAt(LocalDateTime.now())
				.conversationId(conversationId)
				.build();

		// Kiểm tra trước khi gửi
		try {
			notificationEventProducer.sendNotificationEvent(notificationEvent);
		} catch (IllegalArgumentException e) {
			throw e;
		}
	}
	/**
	 * Helper class to hold cursor components.
	 */
	private static class CursorComponents {
		private final LocalDateTime timestamp;
		private final String messageId;

		public CursorComponents(LocalDateTime timestamp, String messageId) {
			this.timestamp = timestamp;
			this.messageId = messageId;
		}
	}
}