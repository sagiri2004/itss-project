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
@Table(name = "community_discussions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CommunityDiscussion {
	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	String id;

	@Column(nullable = false)
	String title;

	@Column(nullable = false, length = 5000)
	String content;

	@Column(nullable = false)
	String incidentType;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "creator_id", nullable = false)
	User creator;

	@Column(nullable = false)
	Boolean isResolved;

	@Column(nullable = false)
	Boolean isClosed;

	@CreationTimestamp
	LocalDateTime createdAt;

	@UpdateTimestamp
	LocalDateTime updatedAt;

	@OneToMany(mappedBy = "discussion", cascade = CascadeType.ALL, orphanRemoval = true)
	@Builder.Default
	List<DiscussionResponse> responses = new ArrayList<>();
}