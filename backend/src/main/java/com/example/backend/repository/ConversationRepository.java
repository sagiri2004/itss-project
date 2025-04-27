package com.example.backend.repository;

import com.example.backend.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, String> {
    List<Conversation> findByUserIdOrderByUpdatedAtDesc(String userId);
    
    List<Conversation> findByRescueCompanyIdOrderByUpdatedAtDesc(String rescueCompanyId);
    
    Optional<Conversation> findByUserIdAndRescueCompanyId(String userId, String rescueCompanyId);
}