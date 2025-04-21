package com.example.backend.controller;

import com.example.backend.dto.request.EmailRequest;
import com.example.backend.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1")
public class UserController {
	@Autowired
	private EmailService emailService;

	@GetMapping("/users")
	@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
	public String userAccess() {
		return "Welcome, User!";
	}

	@GetMapping("/admin")
	@PreAuthorize("hasRole('ADMIN')")
	public String adminAccess() {
		return "Welcome, Admin!";
	}

	@PostMapping("/send")
	public String sendEmail(@RequestBody EmailRequest request) {
		log.info(request.toString());
		emailService.sendEmail(
				request.getTo(),
				request.getSubject(),
				request.getText(),
				request.isHtml()
		);
		return "Email is being sent.";
	}
}
