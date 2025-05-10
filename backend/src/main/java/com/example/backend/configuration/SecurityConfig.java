package com.example.backend.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
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
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import javax.crypto.spec.SecretKeySpec;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
	private final String[] PUBLIC_AUTH_ENDPOINTS = {
			"/api/v1/auth/register",
			"/api/v1/auth/login",
			"/api/v1/auth/validate",
			"/api/v1/send",
			"/api/v1/auth/forgot-password",
			"/api/v1/auth/reset-password",
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
				.authorizeHttpRequests(request -> {
					request.requestMatchers(HttpMethod.POST, PUBLIC_AUTH_ENDPOINTS).permitAll();
					request.requestMatchers(HttpMethod.GET, PUBLIC_AUTH_ENDPOINTS).permitAll();

					// Role-based access patterns
					request.requestMatchers("/admin/**").hasRole("ADMIN");
					request.requestMatchers("/user/**").hasAnyRole("USER", "ADMIN");
					request.requestMatchers("/rescue-companies/**").hasAnyRole("COMPANY", "ADMIN", "USER");
					request.requestMatchers("/rescue-vehicles/**").hasAnyRole("COMPANY", "ADMIN");
					request.requestMatchers("/rescue-requests/**").hasAnyRole("COMPANY", "ADMIN", "USER");

					request.anyRequest().authenticated();
				})
				.oauth2ResourceServer(oauth2 ->
						oauth2.jwt(jwtConfigurer -> jwtConfigurer.decoder(jwtDecoder()))
				);

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
		grantedAuthoritiesConverter.setAuthorityPrefix("ROLE_");
		grantedAuthoritiesConverter.setAuthoritiesClaimName("roles");

		JwtAuthenticationConverter authenticationConverter = new JwtAuthenticationConverter();
		authenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);

		return authenticationConverter;
	}
}