package com.example.backend.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

import javax.crypto.spec.SecretKeySpec;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
	private final String[] PUBLIC_ENDPOINTS = {
			"/api/v1/auth/register",
			"/api/v1/auth/login",
			"/api/v1/auth/validate",
			"/api/v1/send",
			"/api/v1/auth/forgot-password",
			"/api/v1/auth/reset-password",
	};
	@Value("${jwt.signerKey}")
	private String signerKey;

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
		httpSecurity.authorizeHttpRequests(request ->
				request
						// Public endpoints (cho phép tất cả mọi người)
						.requestMatchers(HttpMethod.POST, PUBLIC_ENDPOINTS).permitAll()

						// Chỉ admin mới có thể truy cập các endpoint quản trị
						.requestMatchers("/admin/**").hasRole("ADMIN")

						// Chỉ user đã đăng nhập mới có thể truy cập endpoint này
						.requestMatchers("/user/**").hasAnyRole("USER", "ADMIN")

						.requestMatchers("/rescue-companies/**").hasAnyRole("COMPANY", "ADMIN", "USER")

						.requestMatchers("/rescue-vehicles/**").hasAnyRole("COMPANY", "ADMIN")

						.requestMatchers("/rescue-requests/**").hasAnyRole("COMPANY", "ADMIN", "USER")

						// Mọi request khác phải được xác thực
						.anyRequest().authenticated()
		);

		httpSecurity.oauth2ResourceServer(oauth2 ->
				oauth2.jwt(jwtConfigurer -> jwtConfigurer.decoder(jwtDecoder()))
		);

		httpSecurity.csrf(AbstractHttpConfigurer::disable);

		return httpSecurity.build();
	}

	@Bean
	JwtDecoder jwtDecoder(){
		SecretKeySpec secretKeySpec = new SecretKeySpec(signerKey.getBytes(), "HS512");
		return NimbusJwtDecoder
				.withSecretKey(secretKeySpec)
				.macAlgorithm(MacAlgorithm.HS512)
				.build();
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public JwtAuthenticationConverter jwtAuthenticationConverter() {
		JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
		grantedAuthoritiesConverter.setAuthorityPrefix("ROLE_"); // Prefix cho vai trò
		grantedAuthoritiesConverter.setAuthoritiesClaimName("roles"); // Đọc từ claim "roles"

		JwtAuthenticationConverter authenticationConverter = new JwtAuthenticationConverter();
		authenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);

		return authenticationConverter;
	}
}
