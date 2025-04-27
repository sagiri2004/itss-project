package com.example.backend.service;

import com.example.backend.dto.response.ConversationResponse;
import com.example.backend.dto.response.MessageCursorResponse;
import com.example.backend.model.Message;
import com.example.backend.model.enums.MessageSender;

import java.util.List;

/**
 * Service interface for managing chat functionality in the system.
 * Provides methods for handling messages and conversations.
 */
public interface ChatService {
	/**
	 * Get initial messages for a conversation with pagination.
	 *
	 * @param conversationId ID of the conversation
	 * @param limit          Maximum number of messages to return
	 * @return MessageCursorResponse containing messages and next cursor
	 */
	MessageCursorResponse getInitialMessages(String conversationId, int limit);

	/**
	 * Get messages before a specific cursor for pagination.
	 *
	 * @param conversationId ID of the conversation
	 * @param cursor         Cursor indicating position for pagination
	 * @param limit          Maximum number of messages to return
	 * @return MessageCursorResponse containing messages and next cursor
	 */
	MessageCursorResponse getMessagesBeforeCursor(String conversationId, String cursor, int limit);

	/**
	 * Mark all unread messages in a conversation as read.
	 *
	 * @param conversationId ID of the conversation
	 * @param senderType     Type of the message sender to mark as read
	 */
	void markAllMessagesAsRead(String conversationId, MessageSender senderType);

	/**
	 * Send a new message in a conversation.
	 *
	 * @param userId          ID of the user
	 * @param rescueCompanyId ID of the rescue company
	 * @param content         Content of the message
	 * @param senderType      Type of the sender (USER or RESCUE_COMPANY)
	 * @return The created Message
	 */
	Message sendMessage(String userId, String rescueCompanyId, String content, MessageSender senderType);

	/**
	 * Get all conversations for a user.
	 *
	 * @param userId ID of the user
	 * @return List of ConversationResponse objects
	 */
	List<ConversationResponse> getUserConversations(String userId);

	/**
	 * Get all conversations for a rescue company.
	 *
	 * @param rescueCompanyId ID of the rescue company
	 * @return List of ConversationResponse objects
	 */
	List<ConversationResponse> getCompanyConversations(String rescueCompanyId);
}