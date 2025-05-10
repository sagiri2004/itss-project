package com.example.backend.repository;

import com.example.backend.model.Message;
import com.example.backend.model.enums.MessageSender;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

/**
 * JPA Repository for managing Message entities.
 */
public interface MessageRepository extends JpaRepository<Message, String> {

    /**
     * Retrieves initial messages for a conversation, ordered by sentAt descending.
     *
     * @param conversationId The ID of the conversation.
     * @param pageable       Pagination information.
     * @return A list of messages.
     */
    @Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId " +
            "ORDER BY m.sentAt DESC")
    List<Message> findInitialMessages(
            @Param("conversationId") String conversationId,
            Pageable pageable);

    /**
     * Retrieves messages before a specific cursor (timestamp and message ID) for a conversation.
     *
     * @param conversationId The ID of the conversation.
     * @param timestamp      The timestamp of the cursor.
     * @param messageId      The message ID of the cursor.
     * @param pageable       Pagination information.
     * @return A list of messages.
     */
    @Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId " +
            "AND ((m.sentAt < :timestamp) OR (m.sentAt = :timestamp AND m.id < :messageId)) " +
            "ORDER BY m.sentAt DESC")
    List<Message> findMessagesBeforeCursor(
            @Param("conversationId") String conversationId,
            @Param("timestamp") LocalDateTime timestamp,
            @Param("messageId") String messageId,
            Pageable pageable);

    /**
     * Counts the number of unread messages from a specific sender in a conversation.
     *
     * @param conversationId The ID of the conversation.
     * @param senderType     The type of the message sender.
     * @return The number of unread messages.
     */
    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation.id = :conversationId " +
            "AND m.isRead = false AND m.senderType = :senderType")
    long countUnreadMessages(
            @Param("conversationId") String conversationId,
            @Param("senderType") MessageSender senderType);

    /**
     * Marks all unread messages from a specific sender in a conversation as read.
     *
     * @param conversationId The ID of the conversation.
     * @param senderType     The type of the message sender.
     */
    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.conversation.id = :conversationId " +
            "AND m.isRead = false AND m.senderType = :senderType")
    void markAllAsRead(
            @Param("conversationId") String conversationId,
            @Param("senderType") MessageSender senderType);

    /**
     * Counts the total number of unread messages from rescue companies for a user across all their conversations.
     *
     * @param userId     The ID of the user.
     * @param senderType The type of the message sender (should be RESCUE_COMPANY).
     * @return The total number of unread messages.
     */
    @Query("SELECT COUNT(m) FROM Message m JOIN m.conversation c WHERE c.user.id = :userId " +
            "AND m.senderType = :senderType AND m.isRead = false")
    long countTotalUnreadMessagesForUser(
            @Param("userId") String userId,
            @Param("senderType") MessageSender senderType);

    /**
     * Counts the total number of unread messages from users for a rescue company across all their conversations.
     *
     * @param rescueCompanyId The ID of the rescue company.
     * @param senderType      The type of the message sender (should be USER).
     * @return The total number of unread messages.
     */
    @Query("SELECT COUNT(m) FROM Message m JOIN m.conversation c WHERE c.rescueCompany.id = :rescueCompanyId " +
            "AND m.senderType = :senderType AND m.isRead = false")
    long countTotalUnreadMessagesForCompany(
            @Param("rescueCompanyId") String rescueCompanyId,
            @Param("senderType") MessageSender senderType);
}