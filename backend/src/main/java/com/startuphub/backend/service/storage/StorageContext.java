package com.startuphub.backend.service.storage;

import lombok.Builder;
import lombok.Getter;
import java.util.Map;
import java.util.UUID;

@Getter
@Builder
public class StorageContext {
    private final UploadType uploadType;
    private final Category category;
    private final Map<String, String> attributes;

    public enum Category {
        PROFILE_IMAGE,
        COVER_IMAGE,
        GROUP_ICON,
        CHAT_ATTACHMENT,
        GENERIC
    }

    public static StorageContext forProfileImage(String userId) {
        return StorageContext.builder()
                .uploadType(UploadType.IMAGE)
                .category(Category.PROFILE_IMAGE)
                .attributes(Map.of("userId", userId))
                .build();
    }
    
    public static StorageContext forCoverImage(String userId) {
        return StorageContext.builder()
                .uploadType(UploadType.IMAGE)
                .category(Category.COVER_IMAGE)
                .attributes(Map.of("userId", userId))
                .build();
    }

    public static StorageContext forGroupIcon(UUID workspaceId, UUID roomId, UUID iconId) {
        return StorageContext.builder()
                .uploadType(UploadType.IMAGE)
                .category(Category.GROUP_ICON)
                .attributes(Map.of("workspaceId", workspaceId.toString(), "roomId", roomId.toString(), "iconId", iconId.toString()))
                .build();
    }

    public static StorageContext forChatAttachment(UUID workspaceId, UUID roomId, UUID attachmentId, boolean isVoiceNote) {
        return StorageContext.builder()
                .uploadType(isVoiceNote ? UploadType.VOICE_NOTE : UploadType.ATTACHMENT)
                .category(Category.CHAT_ATTACHMENT)
                .attributes(Map.of(
                        "workspaceId", workspaceId.toString(),
                        "roomId", roomId.toString(),
                        "attachmentId", attachmentId.toString()
                ))
                .build();
    }
    
    public static StorageContext forGeneric() {
        return StorageContext.builder()
                .uploadType(UploadType.ATTACHMENT) // Fallback for generic uploads
                .category(Category.GENERIC)
                .attributes(Map.of())
                .build();
    }
}
