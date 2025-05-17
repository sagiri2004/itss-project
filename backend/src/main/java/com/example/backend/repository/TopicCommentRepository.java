package com.example.backend.repository;

import com.example.backend.model.TopicComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TopicCommentRepository extends JpaRepository<TopicComment, String> {
    List<TopicComment> findByTopicIdOrderByCreatedAtAsc(String topicId);
    List<TopicComment> findByContentContainingIgnoreCase(String keyword);
} 