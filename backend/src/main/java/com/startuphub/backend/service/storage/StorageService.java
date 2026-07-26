package com.startuphub.backend.service.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    
    /**
     * Stores a file securely and returns a unique identifier (which might be a logical URL or path).
     */
    String save(MultipartFile file, StorageContext context);

    /**
     * Loads a file as a Resource (mainly for Local storage).
     */
    Resource load(String fileIdentifier);
    
    /**
     * Deletes a file.
     */
    void delete(String fileIdentifier);
    
    /**
     * Generates a signed URL for client download.
     */
    String generateSignedUrl(String fileIdentifier);
    
    /**
     * Checks if a file exists.
     */
    boolean exists(String fileIdentifier);
}
