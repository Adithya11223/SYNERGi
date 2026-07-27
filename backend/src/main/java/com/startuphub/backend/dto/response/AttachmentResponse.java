package com.startuphub.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AttachmentResponse {
    private String id;
    private String fileName;
    private String mimeType;
    private Long fileSize;
    private String url;
    private String thumbnailUrl;
}
