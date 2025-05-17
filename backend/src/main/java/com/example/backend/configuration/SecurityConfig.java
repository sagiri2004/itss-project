package com.example.backend.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import javax.crypto.spec.SecretKeySpec;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
	private final String[] PUBLIC_AUTH_ENDPOINTS = {
			"/api/v1/auth/**",  // Cho phép tất cả các endpoint trong /auth
			"/v3/api-docs/**",
			"/swagger-ui/**",
			"/swagger-ui.html",
			"/api-docs/**",
			"/v3/**"
	};

	@Value("${jwt.signerKey}")
	private String signerKey;

	@Bean
	public WebMvcConfigurer corsConfigurer() {
		return new WebMvcConfigurer() {
			@Override
			public void addCorsMappings(CorsRegistry registry) {
				// Cho phép mọi origin truy cập mọi endpoint
				registry.addMapping("/**")
						.allowedOrigins("*") // hoặc chỉ định cụ thể
						.allowedMethods("*")
						.allowedHeaders("*");
			}
		};
	}

	@Bean
	public SecurityFilterChain apiSecurityFilterChain(HttpSecurity httpSecurity) throws Exception {
		httpSecurity
				.cors(cors -> {}) // Bật CORS tại đây
				.csrf(AbstractHttpConfigurer::disable)
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(request -> {
					// Cho phép tất cả các endpoint trong PUBLIC_AUTH_ENDPOINTS
					request.requestMatchers(PUBLIC_AUTH_ENDPOINTS).permitAll();
					
					// Yêu cầu xác thực cho tất cả các request khác
					request.anyRequest().authenticated();
				})
				.oauth2ResourceServer(oauth2 -> 
					oauth2.jwt(jwt -> {
						jwt.decoder(jwtDecoder());
						jwt.jwtAuthenticationConverter(jwtAuthenticationConverter());
					})
				);

		return httpSecurity.build();
	}

	@Bean
	JwtDecoder jwtDecoder() {
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
		// Không cần thêm prefix "ROLE_" vì trong token đã có
		grantedAuthoritiesConverter.setAuthorityPrefix("");
		// Sử dụng trường "roles" trong payload
		grantedAuthoritiesConverter.setAuthoritiesClaimName("roles");

		JwtAuthenticationConverter authenticationConverter = new JwtAuthenticationConverter();
		authenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);

		return authenticationConverter;
	}
}