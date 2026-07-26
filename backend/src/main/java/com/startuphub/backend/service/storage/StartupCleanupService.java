package com.startuphub.backend.service.storage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.stream.Stream;

@Slf4j
@Service
public class StartupCleanupService {

    @EventListener(ApplicationReadyEvent.class)
    public void cleanupTempFiles() {
        log.info("Starting cleanup of temporary upload files from previous sessions...");
        
        // Tomcat usually stores its temp upload files in java.io.tmpdir or a designated work folder.
        // We will scan java.io.tmpdir for "upload_*.tmp" and delete them to prevent disk leak.
        String tmpDirStr = System.getProperty("java.io.tmpdir");
        if (tmpDirStr == null) {
            log.warn("java.io.tmpdir is not set. Skipping temp file cleanup.");
            return;
        }

        Path tmpDir = Paths.get(tmpDirStr);
        if (!Files.exists(tmpDir) || !Files.isDirectory(tmpDir)) {
            return;
        }

        try (Stream<Path> stream = Files.list(tmpDir)) {
            long deletedCount = stream
                    .filter(path -> path.getFileName().toString().startsWith("upload_") && path.getFileName().toString().endsWith(".tmp"))
                    .filter(Files::isRegularFile)
                    .mapToLong(path -> {
                        try {
                            Files.deleteIfExists(path);
                            return 1;
                        } catch (IOException e) {
                            log.error("Failed to delete temp file: {}", path, e);
                            return 0;
                        }
                    })
                    .sum();
            
            if (deletedCount > 0) {
                log.info("Successfully cleaned up {} temporary upload files.", deletedCount);
            } else {
                log.info("No temporary upload files found to clean.");
            }
        } catch (IOException e) {
            log.error("Error scanning temp directory for cleanup: {}", tmpDir, e);
        }
    }
}
