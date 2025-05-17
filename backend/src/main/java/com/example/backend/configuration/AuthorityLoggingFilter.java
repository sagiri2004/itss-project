 package com.example.backend.configuration;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;


import java.io.IOException;

@Component
public class AuthorityLoggingFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            System.out.println("[AuthorityLoggingFilter] Authorities: " + authentication.getAuthorities());
            System.out.println("[AuthorityLoggingFilter] Principal: " + authentication.getPrincipal());
        } else {
            System.out.println("[AuthorityLoggingFilter] No authentication present");
        }
        filterChain.doFilter(request, response);
    }
}