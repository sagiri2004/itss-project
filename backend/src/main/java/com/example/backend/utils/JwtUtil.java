package com.example.backend.utils;

import com.example.backend.model.enums.UserRole;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class JwtUtil {

	private final Key secretKey;

	@Value("${jwt.expirationMs}")
	private long expirationMs;

	public JwtUtil(@Value("${jwt.signerKey}") String signerKey) {
		this.secretKey = Keys.hmacShaKeyFor(signerKey.getBytes());
	}

	// 🔐 Tạo JWT token chứa username và các roles (enum)
	public String generateToken(String username, Set<UserRole> roles, String userId) {
		Set<String> roleNames = roles.stream()
				.map(Enum::name)
				.collect(Collectors.toSet());

		return Jwts.builder()
				.setSubject(username)
				.claim("userId", userId) // lưu cả claim riêng
				.claim("roles", roleNames)
				.setIssuedAt(new Date())
				.setExpiration(new Date(System.currentTimeMillis() + expirationMs))
				.signWith(secretKey, SignatureAlgorithm.HS512)
				.compact();
	}

	// 📌 Trích xuất username từ token
	public String extractUsername(String token) {
		return extractClaim(token, Claims::getSubject);
	}

	// 📌 Trích xuất danh sách roles (dạng enum) từ token
	public Set<UserRole> extractRoles(String token) {
		Claims claims = extractAllClaims(token);

		List<?> rawRoles = claims.get("roles", List.class);

		return rawRoles.stream()
				.filter(obj -> obj instanceof String)
				.map(Object::toString)
				.map(roleStr -> {
					try {
						return UserRole.valueOf(roleStr);
					} catch (IllegalArgumentException e) {
						return null; // hoặc bỏ qua nếu không hợp lệ
					}
				})
				.filter(role -> role != null)
				.collect(Collectors.toSet());
	}

	// ✅ Kiểm tra token có hợp lệ không
	public boolean validateToken(String token) {
		try {
			Jwts.parserBuilder()
					.setSigningKey(secretKey)
					.build()
					.parseClaimsJws(token);
			return !isTokenExpired(token);
		} catch (JwtException | IllegalArgumentException e) {
			return false;
		}
	}

	// 🔐 Kiểm tra token có hết hạn không
	private boolean isTokenExpired(String token) {
		return extractExpiration(token).before(new Date());
	}

	// 📌 Trích xuất claim cụ thể
	private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
		final Claims claims = extractAllClaims(token);
		return claimsResolver.apply(claims);
	}

	// 📌 Trích xuất userId từ token (nếu có lưu trong claims)
	public String extractUserId(String token) {
		try {
			Claims claims = extractAllClaims(token);
			return claims.get("userId", String.class);
		} catch (Exception e) {
			return null;
		}
	}

	// 📌 Trích xuất JWT từ chuỗi "Bearer <token>"
	public String extractTokenFromHeader(String authHeader) {
		if (authHeader != null && authHeader.startsWith("Bearer ")) {
			return authHeader.substring(7); // cắt bỏ "Bearer "
		}
		return null;
	}

	// 📌 Trích xuất tất cả claims
	private Claims extractAllClaims(String token) {
		return Jwts.parserBuilder()
				.setSigningKey(secretKey)
				.build()
				.parseClaimsJws(token)
				.getBody();
	}

	// 📌 Trích xuất thời gian hết hạn
	private Date extractExpiration(String token) {
		return extractClaim(token, Claims::getExpiration);
	}
}
