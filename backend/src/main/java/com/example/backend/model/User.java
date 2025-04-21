package com.example.backend.model;

import com.example.backend.model.enums.UserRole; // Import the enum

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "auth_users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {
	@Id
	String id;

	@Column(nullable = false, unique = true)
	String username;

	@Column(nullable = false)
	String password;

	@Column(nullable = false, unique = true)
	String email;

	@Column(nullable = false)
	String name;

	@Column(nullable = true)
	String resetCode;

	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
	@Enumerated(EnumType.STRING) // Store as string in the database
	@Column(name = "role")
	Set<UserRole> roles; // Use UserRole enum here

	@CreationTimestamp
	@Column(updatable = false)
	LocalDateTime createdAt;

	@UpdateTimestamp
	LocalDateTime updatedAt;

	LocalDateTime lastLoginAt;
}
