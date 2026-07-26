package com.startuphub.backend.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.HandlerMapping;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@Tag(name = "Public Files", description = "Securely handles public file downloads")
public class FileDownloadController {

    private final Path fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();

    @GetMapping("/uploads/**")
    public ResponseEntity<Resource> downloadFile(HttpServletRequest request) {
        String path = (String) request.getAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE);
        String bestMatchPattern = (String) request.getAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE);
        String relativePath = new AntPathMatcher().extractPathWithinPattern(bestMatchPattern, path);

        // Security Rule 1: Prevent Path Traversal
        if (relativePath.contains("..")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        // Security Rule 2: Explicitly authorize only allowed public subdirectories
        if (!relativePath.startsWith("profiles/") && 
            !relativePath.startsWith("covers/") && 
            !relativePath.startsWith("generic/")) {
            // All other files (e.g., chat attachments in {startupUuid}/...) are strictly private!
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            Path filePath = fileStorageLocation.resolve(relativePath).normalize();

            // Double check that it didn't escape the uploads directory
            if (!filePath.startsWith(fileStorageLocation)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = "application/octet-stream";
                try {
                    String probed = Files.probeContentType(filePath);
                    if (probed != null) {
                        contentType = probed;
                    }
                } catch (IOException ex) {
                    // ignore
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
