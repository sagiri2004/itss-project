package com.example.backend.dto.response;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
	private String message;
	private String token;
	private String userId;
	// company neu co
	private String companyId;
}
