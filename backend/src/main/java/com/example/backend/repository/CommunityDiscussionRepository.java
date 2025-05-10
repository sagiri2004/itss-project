package com.example.backend.repository;

import com.example.backend.model.CommunityDiscussion;
import com.example.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunityDiscussionRepository extends JpaRepository<CommunityDiscussion, String> {
	Page<CommunityDiscussion> findByOrderByCreatedAtDesc(Pageable pageable);

	Page<CommunityDiscussion> findByIsResolvedAndIsClosedOrderByCreatedAtDesc(
			Boolean isResolved, Boolean isClosed, Pageable pageable);

	Page<CommunityDiscussion> findByIncidentTypeOrderByCreatedAtDesc(String incidentType, Pageable pageable);

	Page<CommunityDiscussion> findByCreatorOrderByCreatedAtDesc(User creator, Pageable pageable);

	@Query("SELECT d FROM CommunityDiscussion d WHERE " +
			"LOWER(d.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
			"LOWER(d.content) LIKE LOWER(CONCAT('%', :keyword, '%'))")
	Page<CommunityDiscussion> searchByKeyword(String keyword, Pageable pageable);
}