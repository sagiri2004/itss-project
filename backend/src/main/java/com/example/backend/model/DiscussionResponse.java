package com.example.backend.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "discussion_responses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DiscussionResponse {
	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	String id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "discussion_id", nullable = false)
	CommunityDiscussion discussion;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "responder_id", nullable = false)
	User responder;

	@Column(nullable = false, length = 3000)
	String content;

	@Column(nullable = false)
	@Builder.Default
	Integer upvotes = 0;

	@Column(nullable = false)
	@Builder.Default
	Integer downvotes = 0;

	@Column(nullable = false)
	@Builder.Default
	Boolean isHelpful = false;

	@CreationTimestamp
	LocalDateTime createdAt;

	@UpdateTimestamp
	LocalDateTime updatedAt;

	@OneToMany(mappedBy = "discussionResponse", cascade = CascadeType.ALL, orphanRemoval = true)
	@Builder.Default
	List<ResponseReport> reports = new ArrayList<>();
}