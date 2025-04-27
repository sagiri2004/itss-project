package com.example.backend.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "conversations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Conversation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rescue_company_id")
    RescueCompany rescueCompany;
    
    @UpdateTimestamp
    LocalDateTime updatedAt;
    
    @CreationTimestamp
    LocalDateTime createdAt;
}