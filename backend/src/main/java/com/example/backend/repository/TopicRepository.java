package com.example.backend.repository;

import com.example.backend.model.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TopicRepository extends JpaRepository<Topic, String> {
    List<Topic> findByCategoryIgnoreCase(String category);
    List<Topic> findByTitleContainingIgnoreCase(String search);
    List<Topic> findByCategoryIgnoreCaseAndTitleContainingIgnoreCase(String category, String search);
    List<Topic> findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(String title, String content);
} 