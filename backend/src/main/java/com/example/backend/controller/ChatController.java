package com.example.backend.controller;

import com.example.backend.dto.request.MessageRequest;
import com.example.backend.dto.response.ConversationResponse;
import com.example.backend.dto.response.MessageCursorResponse;
import com.example.backend.model.Message;
import com.example.backend.model.RescueCompany;
import com.example.backend.model.User;
import com.example.backend.model.enums.MessageSender;
import com.example.backend.repository.RescueCompanyRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {
	private final ChatService chatService;
	private final UserRepository userRepository;
	private final RescueCompanyRepository rescueCompanyRepository;

	@GetMapping("/conversations")
	public ResponseEntity<List<ConversationResponse>> getConversations(Authentication authentication) {
		User currentUser = userRepository.findByUsername(authentication.getName())
				.orElseThrow(() -> new RuntimeException("User not found"));

		// Check if user is a rescue company
		RescueCompany rescueCompany = rescueCompanyRepository.findByUserId(currentUser.getId()).orElse(null);

		if (rescueCompany != null) {
			// User is a rescue company
			return ResponseEntity.ok(chatService.getCompanyConversations(rescueCompany.getId()));
		} else {
			// Regular user
			return ResponseEntity.ok(chatService.getUserConversations(currentUser.getId()));
		}
	}

	@GetMapping("/conversations/{conversationId}/messages")
	public ResponseEntity<MessageCursorResponse> getMessages(
			@PathVariable String conversationId,
			@RequestParam(required = false) String cursor,
			@RequestParam(defaultValue = "20") int limit,
			Authentication authentication) {

		User currentUser = userRepository.findByUsername(authentication.getName())
				.orElseThrow(() -> new RuntimeException("User not found"));

		// Determine user type and mark messages as read
		RescueCompany rescueCompany = rescueCompanyRepository.findByUserId(currentUser.getId()).orElse(null);
		if (rescueCompany != null) {
			// Mark messages from users as read
			chatService.markAllMessagesAsRead(conversationId, MessageSender.USER);
		} else {
			// Mark messages from companies as read
			chatService.markAllMessagesAsRead(conversationId, MessageSender.RESCUE_COMPANY);
		}

		// Return messages with pagination
		if (cursor != null) {
			return ResponseEntity.ok(chatService.getMessagesBeforeCursor(conversationId, cursor, limit));
		} else {
			return ResponseEntity.ok(chatService.getInitialMessages(conversationId, limit));
		}
	}

	@PostMapping("/conversations/{rescueCompanyId}/send")
	public ResponseEntity<Message> sendMessageAsUser(
			@PathVariable String rescueCompanyId,
			@RequestBody MessageRequest request,
			Authentication authentication) {

		User currentUser = userRepository.findByUsername(authentication.getName())
				.orElseThrow(() -> new RuntimeException("User not found"));

		Message message = chatService.sendMessage(
				currentUser.getId(),
				rescueCompanyId,
				request.getContent(),
				MessageSender.USER
		);

		log.info("Message sent successfully: {}", message);

		return ResponseEntity.ok(message);
	}

	@PostMapping("/conversations/user/{userId}/send")
	public ResponseEntity<Message> sendMessageAsCompany(
			@PathVariable String userId,
			@RequestBody MessageRequest request,
			Authentication authentication) {

		User currentUser = userRepository.findByUsername(authentication.getName())
				.orElseThrow(() -> new RuntimeException("User not found"));

		// Ensure user is a rescue company
		RescueCompany rescueCompany = rescueCompanyRepository.findByUserId(currentUser.getId())
				.orElseThrow(() -> new RuntimeException("You are not authorized as a rescue company"));

		Message message = chatService.sendMessage(
				userId,
				rescueCompany.getId(),
				request.getContent(),
				MessageSender.RESCUE_COMPANY
		);

		return ResponseEntity.ok(message);
	}
}