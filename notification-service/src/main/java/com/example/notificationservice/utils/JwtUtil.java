package com.example.notificationservice.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;


@Component
public class JwtUtil {

	private final Key secretKey;


	public JwtUtil(@Value("${jwt.signerKey}") String signerKey) {
		this.secretKey = Keys.hmacShaKeyFor(signerKey.getBytes());
	}

	// 📌 Trích xuất username từ token
	public String extractUsername(String token) {
		return extractClaim(token, Claims::getSubject);
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
