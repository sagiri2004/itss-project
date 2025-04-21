package com.example.backend.dto.request;

import com.example.backend.model.enums.UserRole;  // Import UserRole enum
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;
import java.util.HashSet;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RegisterRequest {
	String username;
	String password;
	String email;
	String name;

	@Builder.Default
	Set<UserRole> roles = new HashSet<>(Set.of(UserRole.USER));
}
