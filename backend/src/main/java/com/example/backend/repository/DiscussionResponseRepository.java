package com.example.backend.repository;

import com.example.backend.model.CommunityDiscussion;
import com.example.backend.model.DiscussionResponse;
import com.example.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiscussionResponseRepository extends JpaRepository<DiscussionResponse, String> {
	List<DiscussionResponse> findByDiscussionOrderByCreatedAtAsc(CommunityDiscussion discussion);

	List<DiscussionResponse> findByDiscussionOrderByUpvotesDescCreatedAtAsc(CommunityDiscussion discussion);

	Page<DiscussionResponse> findByResponderOrderByCreatedAtDesc(User responder, Pageable pageable);

	long countByDiscussion(CommunityDiscussion discussion);
}