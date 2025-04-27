package com.example.backend.repository;

import com.example.backend.model.Message;
import com.example.backend.model.enums.MessageSender;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, String> {
    
    @Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId " +
           "ORDER BY m.sentAt DESC")
    List<Message> findInitialMessages(
            @Param("conversationId") String conversationId,
            Pageable pageable);
    
    @Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId " +
           "AND ((m.sentAt < :timestamp) OR (m.sentAt = :timestamp AND m.id < :messageId)) " +
           "ORDER BY m.sentAt DESC")
    List<Message> findMessagesBeforeCursor(
            @Param("conversationId") String conversationId,
            @Param("timestamp") LocalDateTime timestamp,
            @Param("messageId") String messageId,
            Pageable pageable);
    
    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation.id = :conversationId " +
           "AND m.isRead = false AND m.senderType = :senderType")
    long countUnreadMessages(
            @Param("conversationId") String conversationId,
            @Param("senderType") MessageSender senderType);
    
    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.conversation.id = :conversationId " +
           "AND m.isRead = false AND m.senderType = :senderType")
    void markAllAsRead(
            @Param("conversationId") String conversationId,
            @Param("senderType") MessageSender senderType);
}