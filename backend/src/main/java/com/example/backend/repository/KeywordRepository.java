package com.example.backend.repository;

import com.example.backend.model.Keyword;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface KeywordRepository extends JpaRepository<Keyword, String> {
    boolean existsByWordIgnoreCase(String word);
} 