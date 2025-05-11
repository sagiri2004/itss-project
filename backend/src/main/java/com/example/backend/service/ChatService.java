package com.example.backend.service;

import com.example.backend.dto.response.ConversationResponse;
import com.example.backend.dto.response.MessageCursorResponse;
import com.example.backend.model.Message;
import com.example.backend.model.enums.MessageSender;

import java.util.List;

/**
 * Service interface for managing chat functionality in the system.
 * Provides methods for handling messages, conversations, conversation details, and unread message counts.
 */
public interface ChatService {

	/**
	 * Retrieves initial messages for a conversation with pagination.
	 *
	 * @param conversationId The ID of the conversation.
	 * @param limit          Maximum number of messages to return.
	 * @param sort           Sort order for messages (asc/desc).
	 * @return MessageCursorResponse containing messages and next cursor.
	 */
	MessageCursorResponse getInitialMessages(String conversationId, int limit, String sort);

	/**
	 * Retrieves messages before a specific cursor for pagination.
	 *
	 * @param conversationId The ID of the conversation.
	 * @param cursor         Cursor indicating position for pagination.
	 * @param limit          Maximum number of messages to return.
	 * @param sort           Sort order for messages (asc/desc).
	 * @return MessageCursorResponse containing messages and next cursor.
	 */
	MessageCursorResponse getMessagesBeforeCursor(String conversationId, String cursor, int limit, String sort);

	/**
	 * Marks all unread messages in a conversation as read.
	 *
	 * @param conversationId The ID of the conversation.
	 * @param senderType     Type of the message sender to mark as read.
	 */
	void markAllMessagesAsRead(String conversationId, MessageSender senderType);

	/**
	 * Sends a new message in a conversation.
	 *
	 * @param userId          The ID of the user.
	 * @param rescueCompanyId The ID of the rescue company.
	 * @param content         The content of the message.
	 * @param senderType      The type of the sender (USER or RESCUE_COMPANY).
	 * @return The created Message.
	 */
	Message sendMessage(String userId, String rescueCompanyId, String content, MessageSender senderType);

	/**
	 * Retrieves all conversations for a user.
	 *
	 * @param userId The ID of the user.
	 * @return List of ConversationResponse objects.
	 */
	List<ConversationResponse> getUserConversations(String userId);

	/**
	 * Retrieves all conversations for a rescue company.
	 *
	 * @param rescueCompanyId The ID of the rescue company.
	 * @return List of ConversationResponse objects.
	 */
	List<ConversationResponse> getCompanyConversations(String rescueCompanyId);

	/**
	 * Retrieves details of a specific conversation by its ID.
	 *
	 * @param conversationId The ID of the conversation.
	 * @return ConversationResponse containing conversation details.
	 */
	ConversationResponse getConversationById(String conversationId);

	/**
	 * Counts the total number of unread messages for a user across all their conversations.
	 *
	 * @param userId The ID of the user.
	 * @return The total number of unread messages from rescue companies.
	 */
	long countTotalUnreadMessagesForUser(String userId);

	/**
	 * Counts the total number of unread messages for a rescue company across all their conversations.
	 *
	 * @param rescueCompanyId The ID of the rescue company.
	 * @return The total number of unread messages from users.
	 */
	long countTotalUnreadMessagesForCompany(String rescueCompanyId);
}