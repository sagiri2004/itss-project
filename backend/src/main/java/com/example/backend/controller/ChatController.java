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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for managing chat functionality.
 * Provides endpoints for retrieving conversations, messages, sending messages, and unread message counts.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@Validated
@Tag(name = "Chat", description = "API for managing conversations and messages")
public class ChatController {

	private final ChatService chatService;
	private final UserRepository userRepository;
	private final RescueCompanyRepository rescueCompanyRepository;

	/**
	 * Retrieves all conversations for the authenticated user or rescue company.
	 *
	 * @param authentication The authentication object containing user details.
	 * @return A ResponseEntity containing a list of ConversationResponse objects.
	 * @throws RuntimeException if the user is not found.
	 */
	@GetMapping("/conversations")
	@Operation(summary = "Get all conversations",
			description = "Retrieves all conversations for the authenticated user or rescue company.",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponse(responseCode = "200", description = "Successfully retrieved conversations",
			content = @Content(mediaType = "application/json",
					schema = @Schema(implementation = ConversationResponse.class)))
	public ResponseEntity<List<ConversationResponse>> getConversations(Authentication authentication) {
		log.debug("Fetching conversations for user: {}", authentication.getName());

		// Retrieve the authenticated user
		User currentUser = userRepository.findByUsername(authentication.getName())
				.orElseThrow(() -> new RuntimeException("User not found with username: " + authentication.getName()));

		// Check if the user is associated with a rescue company
		RescueCompany rescueCompany = rescueCompanyRepository.findByUserId(currentUser.getId()).orElse(null);

		if (rescueCompany != null) {
			// User is a rescue company; fetch company conversations
			log.info("Fetching conversations for rescue company ID: {}", rescueCompany.getId());
			return ResponseEntity.ok(chatService.getCompanyConversations(rescueCompany.getId()));
		} else {
			// Regular user; fetch user conversations
			log.info("Fetching conversations for user ID: {}", currentUser.getId());
			return ResponseEntity.ok(chatService.getUserConversations(currentUser.getId()));
		}
	}

	/**
	 * Retrieves details of a specific conversation by its ID.
	 *
	 * @param conversationId The ID of the conversation to retrieve.
	 * @param authentication The authentication object containing user details.
	 * @return A ResponseEntity containing the ConversationResponse object.
	 * @throws RuntimeException if the user or conversation is not found, or if the user is not authorized.
	 */
	@GetMapping("/conversations/{conversationId}")
	@Operation(summary = "Get conversation details",
			description = "Retrieves details of a specific conversation, including user and company information.",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Successfully retrieved conversation",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = ConversationResponse.class))),
			@ApiResponse(responseCode = "403", description = "User is not authorized to access this conversation"),
			@ApiResponse(responseCode = "404", description = "Conversation or user not found")
	})
	public ResponseEntity<ConversationResponse> getConversationById(
			@Parameter(description = "ID of the conversation", required = true)
			@PathVariable String conversationId,
			Authentication authentication) {
		log.debug("Fetching conversation with ID: {}", conversationId);

		// Retrieve the authenticated user
		User currentUser = userRepository.findByUsername(authentication.getName())
				.orElseThrow(() -> new RuntimeException("User not found with username: " + authentication.getName()));

		// Fetch the conversation details
		ConversationResponse conversation = chatService.getConversationById(conversationId);

		// Check if the user is authorized to access the conversation
		RescueCompany rescueCompany = rescueCompanyRepository.findByUserId(currentUser.getId()).orElse(null);
		boolean isAuthorized = (rescueCompany != null && conversation.getCompany().getId().equals(rescueCompany.getId()))
				|| conversation.getUser().getId().equals(currentUser.getId());

		if (!isAuthorized) {
			log.warn("User {} is not authorized to access conversation {}", currentUser.getId(), conversationId);
			throw new RuntimeException("User is not authorized to access this conversation");
		}

		log.info("Successfully retrieved conversation ID: {}", conversationId);
		return ResponseEntity.ok(conversation);
	}

	/**
	 * Retrieves the total number of unread messages across all conversations for the authenticated user or rescue company.
	 *
	 * @param authentication The authentication object containing user details.
	 * @return A ResponseEntity containing a map with the total unread message count.
	 * @throws RuntimeException if the user is not found.
	 */
	@GetMapping("/unread-messages/count")
	@Operation(summary = "Get total unread messages count",
			description = "Retrieves the total number of unread messages across all conversations for the authenticated user or rescue company.",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponse(responseCode = "200", description = "Successfully retrieved unread messages count",
			content = @Content(mediaType = "application/json",
					schema = @Schema(implementation = Map.class)))
	public ResponseEntity<Map<String, Long>> getTotalUnreadMessagesCount(Authentication authentication) {
		log.debug("Fetching total unread messages count for user: {}", authentication.getName());

		// Retrieve the authenticated user
		User currentUser = userRepository.findByUsername(authentication.getName())
				.orElseThrow(() -> new RuntimeException("User not found with username: " + authentication.getName()));

		// Check if the user is associated with a rescue company
		RescueCompany rescueCompany = rescueCompanyRepository.findByUserId(currentUser.getId()).orElse(null);
		long totalUnreadMessages;

		if (rescueCompany != null) {
			// Count unread messages from users for the rescue company
			log.debug("Counting unread user messages for company ID: {}", rescueCompany.getId());
			totalUnreadMessages = chatService.countTotalUnreadMessagesForCompany(rescueCompany.getId());
		} else {
			// Count unread messages from companies for the user
			log.debug("Counting unread company messages for user ID: {}", currentUser.getId());
			totalUnreadMessages = chatService.countTotalUnreadMessagesForUser(currentUser.getId());
		}

		log.info("Total unread messages for user ID {}: {}", currentUser.getId(), totalUnreadMessages);
		return ResponseEntity.ok(Map.of("totalUnreadMessages", totalUnreadMessages));
	}

	/**
	 * Retrieves paginated messages for a specific conversation.
	 * Supports cursor-based pagination and optionally marks messages as read based on user type.
	 *
	 * @param conversationId The ID of the conversation.
	 * @param cursor         Optional cursor for pagination (null for initial messages).
	 * @param limit          Number of messages to retrieve (default 20, minimum 1).
	 * @param sort           Sort order for messages (default "desc" for newest first).
	 * @param markAsRead     Whether to mark messages as read (default true).
	 * @param authentication The authentication object containing user details.
	 * @return A ResponseEntity containing a MessageCursorResponse with messages and next cursor.
	 * @throws RuntimeException if the user or conversation is not found.
	 */
	@GetMapping("/conversations/{conversationId}/messages")
	@Operation(summary = "Get messages in a conversation",
			description = "Retrieves paginated messages for a conversation, with optional cursor, sort order, and read marking.",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Successfully retrieved messages",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = MessageCursorResponse.class))),
			@ApiResponse(responseCode = "400", description = "Invalid limit, cursor, or sort parameter"),
			@ApiResponse(responseCode = "403", description = "User is not authorized to access this conversation"),
			@ApiResponse(responseCode = "404", description = "Conversation or user not found")
	})
	public ResponseEntity<MessageCursorResponse> getMessages(
			@Parameter(description = "ID of the conversation", required = true)
			@PathVariable String conversationId,
			@Parameter(description = "Cursor for pagination (optional)")
			@RequestParam(required = false) String cursor,
			@Parameter(description = "Number of messages to retrieve (default 20)")
			@RequestParam(defaultValue = "20") @Min(1) int limit,
			@Parameter(description = "Sort order (asc/desc, default desc)")
			@RequestParam(defaultValue = "desc") String sort,
			@Parameter(description = "Whether to mark messages as read (default true)")
			@RequestParam(defaultValue = "true") boolean markAsRead,
			Authentication authentication) {
		log.debug("Fetching messages for conversation ID: {}, cursor: {}, limit: {}, sort: {}, markAsRead: {}",
				conversationId, cursor, limit, sort, markAsRead);

		// Validate sort parameter
		if (!sort.equalsIgnoreCase("asc") && !sort.equalsIgnoreCase("desc")) {
			log.error("Invalid sort parameter: {}", sort);
			throw new IllegalArgumentException("Sort must be 'asc' or 'desc'");
		}

		// Retrieve the authenticated user
		User currentUser = userRepository.findByUsername(authentication.getName())
				.orElseThrow(() -> new RuntimeException("User not found with username: " + authentication.getName()));

		// Verify user is authorized to access the conversation
		ConversationResponse conversation = chatService.getConversationById(conversationId);
		RescueCompany rescueCompany = rescueCompanyRepository.findByUserId(currentUser.getId()).orElse(null);
		boolean isAuthorized = (rescueCompany != null && conversation.getCompany().getId().equals(rescueCompany.getId()))
				|| conversation.getUser().getId().equals(currentUser.getId());

		if (!isAuthorized) {
			log.warn("User {} is not authorized to access conversation {}", currentUser.getId(), conversationId);
			throw new RuntimeException("User is not authorized to access this conversation");
		}

		// Mark messages as read if requested
		if (markAsRead) {
			if (rescueCompany != null) {
				// Mark messages from users as read
				log.debug("Marking user messages as read for company ID: {}", rescueCompany.getId());
				chatService.markAllMessagesAsRead(conversationId, MessageSender.USER);
			} else {
				// Mark messages from companies as read
				log.debug("Marking company messages as read for user ID: {}", currentUser.getId());
				chatService.markAllMessagesAsRead(conversationId, MessageSender.RESCUE_COMPANY);
			}
		}

		// Fetch messages based on pagination parameters
		MessageCursorResponse response;
		if (cursor != null) {
			log.debug("Fetching messages before cursor: {}", cursor);
			response = chatService.getMessagesBeforeCursor(conversationId, cursor, limit, sort);
		} else {
			log.debug("Fetching initial messages");
			response = chatService.getInitialMessages(conversationId, limit, sort);
		}

		log.info("Successfully retrieved {} messages for conversation ID: {}", response.getMessages().size(), conversationId);
		return ResponseEntity.ok(response);
	}

	/**
	 * Sends a message from a user to a rescue company.
	 *
	 * @param rescueCompanyId The ID of the rescue company to send the message to.
	 * @param request         The message content.
	 * @param authentication  The authentication object containing user details.
	 * @return A ResponseEntity containing the sent Message.
	 * @throws RuntimeException if the user or rescue company is not found.
	 */
	@PostMapping("/conversations/{rescueCompanyId}/send")
	@Operation(summary = "Send message as user",
			description = "Sends a message from a user to a rescue company.",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Message sent successfully",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = Message.class))),
			@ApiResponse(responseCode = "400", description = "Invalid message content"),
			@ApiResponse(responseCode = "404", description = "User or rescue company not found")
	})
	public ResponseEntity<Message> sendMessageAsUser(
			@Parameter(description = "ID of the rescue company", required = true)
			@PathVariable String rescueCompanyId,
			@Parameter(description = "Message content", required = true)
			@RequestBody @Valid MessageRequest request,
			Authentication authentication) {
		log.debug("Sending message from user to rescue company ID: {}", rescueCompanyId);

		// Retrieve the authenticated user
		User currentUser = userRepository.findByUsername(authentication.getName())
				.orElseThrow(() -> new RuntimeException("User not found with username: " + authentication.getName()));

		// Send the message
		Message message = chatService.sendMessage(
				currentUser.getId(),
				rescueCompanyId,
				request.getContent(),
				MessageSender.USER
		);

		log.info("Message sent successfully from user ID: {} to company ID: {}", currentUser.getId(), rescueCompanyId);
		return ResponseEntity.ok(message);
	}

	/**
	 * Sends a message from a rescue company to a user.
	 *
	 * @param userId         The ID of the user to send the message to.
	 * @param request        The message content.
	 * @param authentication The authentication object containing user details.
	 * @return A ResponseEntity containing the sent Message.
	 * @throws RuntimeException if the user is not a rescue company or if the recipient user is not found.
	 */
	@PostMapping("/conversations/user/{userId}/send")
	@Operation(summary = "Send message as rescue company",
			description = "Sends a message from a rescue company to a user.",
			security = @SecurityRequirement(name = "bearerAuth"))
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Message sent successfully",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = Message.class))),
			@ApiResponse(responseCode = "400", description = "Invalid message content"),
			@ApiResponse(responseCode = "403", description = "User is not authorized as a rescue company"),
			@ApiResponse(responseCode = "404", description = "User or rescue company not found")
	})
	public ResponseEntity<Message> sendMessageAsCompany(
			@Parameter(description = "ID of the user", required = true)
			@PathVariable String userId,
			@Parameter(description = "Message content", required = true)
			@RequestBody @Valid MessageRequest request,
			Authentication authentication) {
		log.debug("Sending message from rescue company to user ID: {}", userId);

		// Retrieve the authenticated user
		User currentUser = userRepository.findByUsername(authentication.getName())
				.orElseThrow(() -> new RuntimeException("User not found with username: " + authentication.getName()));

		// Ensure the user is a rescue company
		RescueCompany rescueCompany = rescueCompanyRepository.findByUserId(currentUser.getId())
				.orElseThrow(() -> new RuntimeException("User is not authorized as a rescue company"));

		// Send the message
		Message message = chatService.sendMessage(
				userId,
				rescueCompany.getId(),
				request.getContent(),
				MessageSender.RESCUE_COMPANY
		);

		log.info("Message sent successfully from company ID: {} to user ID: {}", rescueCompany.getId(), userId);
		return ResponseEntity.ok(message);
	}
}