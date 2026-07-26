package com.startuphub.backend.controller;

import com.startuphub.backend.dto.ApiResponse;
import com.startuphub.backend.service.storage.StorageService;
import com.startuphub.backend.service.storage.StorageContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
@Tag(name = "Files", description = "Endpoints for generic file uploads")
public class FileController {

    private final StorageService storageService;

    @PostMapping("/upload")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Upload File", description = "Uploads a generic file and returns its URL.")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadFile(
            @RequestParam("file") MultipartFile file) {
        String url = storageService.save(file, StorageContext.forGeneric());
        return ResponseEntity.ok(ApiResponse.success(Map.of("url", url), "File uploaded successfully"));
    }
}
