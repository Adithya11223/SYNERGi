package com.startuphub.backend.entity.notes;

import com.startuphub.backend.entity.BaseEntity;
import com.startuphub.backend.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "note_folders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoteFolder extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, updatable = false)
    @Builder.Default
    private UUID uuid = UUID.randomUUID();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    private UUID parentId;

    @Column(length = 100)
    private String icon;
}
