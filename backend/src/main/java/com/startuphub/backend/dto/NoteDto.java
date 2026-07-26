package com.startuphub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoteDto {
    private String id;
    private String title;
    private String content;
    private String folderId;
    private List<String> tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isPinned;
    private boolean isLocked;
    private String password;
    private boolean isFavorite;
    private String status;
}
