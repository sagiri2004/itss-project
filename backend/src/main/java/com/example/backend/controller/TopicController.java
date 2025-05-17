package com.example.backend.controller;

import com.example.backend.dto.request.TopicCreateRequest;
import com.example.backend.dto.request.TopicCommentCreateRequest;
import com.example.backend.dto.response.TopicResponse;
import com.example.backend.dto.response.TopicCommentResponse;
import com.example.backend.service.TopicService;
import com.example.backend.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/topics")
@RequiredArgsConstructor
public class TopicController {
    private final TopicService topicService;
    private final JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<TopicResponse> createTopic(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("category") String category,
            @RequestParam(value = "imageUrl", required = false) String imageUrl,
            @RequestHeader("Authorization") String authHeader) {
        String token = jwtUtil.extractTokenFromHeader(authHeader);
        String userId = jwtUtil.extractUserId(token);
        TopicCreateRequest request = new TopicCreateRequest();
        request.setTitle(title);
        request.setContent(content);
        request.setCategory(category);
        request.setImageUrl(imageUrl);
        return ResponseEntity.ok(topicService.createTopic(request, userId, null, null));
    }

    @GetMapping
    public ResponseEntity<List<TopicResponse>> getTopics(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(topicService.getTopics(category, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TopicResponse> getTopicById(@PathVariable String id) {
        return ResponseEntity.ok(topicService.getTopicById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTopic(@PathVariable String id, @RequestHeader("Authorization") String authHeader) {
        String token = jwtUtil.extractTokenFromHeader(authHeader);
        String userId = jwtUtil.extractUserId(token);
        // TODO: check isAdmin bằng roles trong token nếu cần
        boolean isAdmin = false;
        topicService.deleteTopic(id, userId, isAdmin);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{topicId}/comments")
    public ResponseEntity<TopicCommentResponse> addComment(
            @PathVariable String topicId,
            @RequestBody TopicCommentCreateRequest request,
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = jwtUtil.extractTokenFromHeader(authHeader);
        String userId = jwtUtil.extractUserId(token);
        return ResponseEntity.ok(topicService.addComment(topicId, request, userId, null, null));
    }

    @GetMapping("/{topicId}/comments")
    public ResponseEntity<List<TopicCommentResponse>> getComments(@PathVariable String topicId) {
        return ResponseEntity.ok(topicService.getComments(topicId));
    }

    @DeleteMapping("/{topicId}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable String topicId, @PathVariable String commentId, @RequestHeader("Authorization") String authHeader) {
        String token = jwtUtil.extractTokenFromHeader(authHeader);
        String userId = jwtUtil.extractUserId(token);
        // TODO: check isAdmin bằng roles trong token nếu cần
        boolean isAdmin = false;
        topicService.deleteComment(topicId, commentId, userId, isAdmin);
        return ResponseEntity.noContent().build();
    }
} 