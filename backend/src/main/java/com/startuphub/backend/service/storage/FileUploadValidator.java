package com.startuphub.backend.service.storage;

import com.startuphub.backend.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Set;

@Slf4j
@Component
public class FileUploadValidator {

    private final Tika tika = new Tika();

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of("image/jpeg", "image/png", "image/jpg", "image/webp", "image/gif");
    private static final Set<String> ALLOWED_VOICE_TYPES = Set.of("audio/ogg", "audio/mpeg", "audio/mp4", "audio/webm", "video/webm", "audio/wav", "video/mp4");
    private static final Set<String> ALLOWED_DOC_TYPES = Set.of("application/pdf");
    
    private static final Set<String> DANGEROUS_MIME_TYPES = Set.of(
            "application/x-sh", "application/x-executable", "application/x-msdownload",
            "application/x-bat", "text/html", "image/svg+xml", "text/x-php", "application/x-python",
            "application/javascript", "text/javascript", "application/java-archive"
    );
    
    private static final Set<String> DANGEROUS_EXTENSIONS = Set.of(
            ".exe", ".sh", ".bat", ".cmd", ".msi", ".php", ".pl", ".cgi", ".jar", ".jsp", ".asp", ".aspx", ".html", ".htm", ".svg", ".js"
    );

    public void validate(MultipartFile file, UploadType type) {
        if (file.isEmpty()) {
            throw new BadRequestException("Failed to store empty file.");
        }

        long maxSize = getMaxSize(type);
        if (file.getSize() > maxSize) {
            throw new BadRequestException("File size exceeds the maximum limit of " + (maxSize / 1024 / 1024) + "MB.");
        }

        String detectedType;
        try {
            detectedType = tika.detect(file.getInputStream());
        } catch (IOException e) {
            log.error("Failed to read file signature", e);
            throw new BadRequestException("Failed to validate file contents. File may be corrupted.");
        }

        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        if (isDangerous(detectedType, originalName)) {
            log.warn("Blocked dangerous file upload. Type: {}, Name: {}", detectedType, originalName);
            throw new BadRequestException("File format is not allowed for security reasons.");
        }

        if (!isAllowedMimeType(detectedType, type)) {
            log.warn("Invalid file signature detected: expected type {}, got {}", type, detectedType);
            throw new BadRequestException("File type not allowed for this upload context.");
        }
    }

    private long getMaxSize(UploadType type) {
        return switch (type) {
            case IMAGE -> 10L * 1024 * 1024;       // 10 MB
            case VOICE_NOTE -> 50L * 1024 * 1024;  // 50 MB
            case DOCUMENT -> 50L * 1024 * 1024;    // 50 MB
            case ATTACHMENT -> 100L * 1024 * 1024; // 100 MB
        };
    }

    private boolean isDangerous(String mimeType, String filename) {
        if (DANGEROUS_MIME_TYPES.contains(mimeType)) {
            return true;
        }
        for (String ext : DANGEROUS_EXTENSIONS) {
            if (filename.endsWith(ext)) {
                return true;
            }
        }
        return false;
    }

    private boolean isAllowedMimeType(String mimeType, UploadType type) {
        return switch (type) {
            case IMAGE -> ALLOWED_IMAGE_TYPES.contains(mimeType);
            case VOICE_NOTE -> ALLOWED_VOICE_TYPES.contains(mimeType);
            case DOCUMENT -> ALLOWED_DOC_TYPES.contains(mimeType);
            case ATTACHMENT -> true; // Already passed isDangerous check
        };
    }
}
