package com.startuphub.backend.service.storage;

import com.startuphub.backend.exception.BadRequestException;
import com.startuphub.backend.service.UrlSignerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.stream.Stream;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
public class LocalStorageServiceImpl implements StorageService {

    @Value("${app.storage.local.dir:uploads}")
    private String uploadDir;

    @Autowired
    private FileUploadValidator fileUploadValidator;

    @Autowired
    private UrlSignerService urlSignerService;

    private Path rootLocation;

    @PostConstruct
    public void init() {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create upload directory!", ex);
        }
    }

    @Override
    public String save(MultipartFile file, StorageContext context) {
        fileUploadValidator.validate(file, context.getUploadType());

        String originalName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");
        if(originalName.contains("..")) {
            throw new BadRequestException("Sorry! Filename contains invalid path sequence " + originalName);
        }

        String extension = "";
        int i = originalName.lastIndexOf('.');
        if (i > 0) {
            extension = originalName.substring(i);
        }

        // Generate the physical path and logical identifier
        PhysicalPath physicalPath = buildPhysicalPath(context, extension);
        
        try {
            Files.createDirectories(physicalPath.targetLocation.getParent());
            try (var inputStream = file.getInputStream()) {
                Files.copy(inputStream, physicalPath.targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }

            if (TransactionSynchronizationManager.isSynchronizationActive()) {
                TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                    @Override
                    public void afterCompletion(int status) {
                        if (status == STATUS_ROLLED_BACK) {
                            try {
                                Files.deleteIfExists(physicalPath.targetLocation);
                                log.info("Rolled back file upload: {}", physicalPath.targetLocation);
                            } catch (IOException e) {
                                log.error("Failed to clean up file after rollback: {}", physicalPath.targetLocation, e);
                            }
                        } else if (status == STATUS_COMMITTED) {
                            log.info("Successfully committed file upload: {}", physicalPath.targetLocation);
                        }
                    }
                });
            }

            return physicalPath.identifier;
        } catch (IOException ex) {
            throw new BadRequestException("Could not store file. Please try again!");
        }
    }

    @Override
    public Resource load(String fileIdentifier) {
        try {
            Path filePath = resolveIdentifierToPath(fileIdentifier);
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new BadRequestException("File not found");
            }
        } catch (MalformedURLException ex) {
            throw new BadRequestException("File not found: " + ex.getMessage());
        }
    }

    @Override
    public void delete(String fileIdentifier) {
        if (fileIdentifier == null) return;
        Path filePath = resolveIdentifierToPath(fileIdentifier);
        
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    try {
                        Files.deleteIfExists(filePath);
                        log.info("Successfully deleted file after commit: {}", filePath);
                    } catch (IOException ex) {
                        log.error("Failed to delete file after commit: {}", filePath, ex);
                    }
                }
            });
        } else {
            try {
                Files.deleteIfExists(filePath);
                log.info("Successfully deleted file (no transaction): {}", filePath);
            } catch (IOException ex) {
                log.error("Failed to delete file (no transaction): {}", filePath, ex);
            }
        }
    }

    @Override
    public String generateSignedUrl(String fileIdentifier) {
        // If it's a direct upload path (like profile images), return it as is or sign if needed.
        // For Local Storage, we will sign all paths.
        return urlSignerService.signUrl(fileIdentifier);
    }

    @Override
    public boolean exists(String fileIdentifier) {
        Path filePath = resolveIdentifierToPath(fileIdentifier);
        return Files.exists(filePath);
    }

    private static class PhysicalPath {
        Path targetLocation;
        String identifier;
    }

    private PhysicalPath buildPhysicalPath(StorageContext context, String extension) {
        PhysicalPath result = new PhysicalPath();
        Map<String, String> attrs = context.getAttributes();

        switch (context.getCategory()) {
            case PROFILE_IMAGE:
                String pUserId = attrs.get("userId");
                String pFileName = UUID.randomUUID().toString() + extension;
                result.targetLocation = this.rootLocation.resolve("profiles").resolve(pUserId).resolve(pFileName);
                result.identifier = "/uploads/profiles/" + pUserId + "/" + pFileName;
                break;
            case COVER_IMAGE:
                String cUserId = attrs.get("userId");
                String cFileName = UUID.randomUUID().toString() + extension;
                result.targetLocation = this.rootLocation.resolve("covers").resolve(cUserId).resolve(cFileName);
                result.identifier = "/uploads/covers/" + cUserId + "/" + cFileName;
                break;
            case CHAT_ATTACHMENT:
                String aWorkspaceId = attrs.get("workspaceId");
                String aRoomId = attrs.get("roomId");
                String aAttachmentId = attrs.get("attachmentId");
                String aFileName = aAttachmentId + extension;
                result.targetLocation = this.rootLocation.resolve(aWorkspaceId).resolve(aFileName);
                result.identifier = "/api/v1/workspaces/" + aWorkspaceId + "/chat/rooms/" + aRoomId + "/attachments/" + aAttachmentId;
                break;
            case GROUP_ICON:
                String gWorkspaceId = attrs.get("workspaceId");
                String gRoomId = attrs.get("roomId");
                String gIconId = attrs.get("iconId");
                String gFileName = gIconId + extension;
                result.targetLocation = this.rootLocation.resolve(gWorkspaceId).resolve(gFileName);
                result.identifier = "/api/v1/workspaces/" + gWorkspaceId + "/chat/rooms/" + gRoomId + "/attachments/" + gIconId;
                break;
            case GENERIC:
            default:
                String genericFolder = UUID.randomUUID().toString();
                String genericFileName = UUID.randomUUID().toString() + extension;
                result.targetLocation = this.rootLocation.resolve("generic").resolve(genericFolder).resolve(genericFileName);
                result.identifier = "/uploads/generic/" + genericFolder + "/" + genericFileName;
                break;
        }
        return result;
    }

    private Path resolveIdentifierToPath(String fileIdentifier) {
        if (fileIdentifier.startsWith("/uploads/")) {
            // e.g. /uploads/profiles/123/file.jpg
            String relativePath = fileIdentifier.substring("/uploads/".length());
            Path resolved = this.rootLocation.resolve(relativePath).normalize();
            if (!resolved.startsWith(this.rootLocation)) {
                throw new SecurityException("Path traversal attempt");
            }
            return resolved;
        } else if (fileIdentifier.startsWith("/api/v1/workspaces/")) {
            // e.g. /api/v1/workspaces/{workspaceId}/chat/rooms/{roomId}/attachments/{attachmentId}
            String[] parts = fileIdentifier.split("/");
            if (parts.length >= 10) {
                String workspaceId = parts[4];
                String attachmentId = parts[9];
                Path workspaceDir = this.rootLocation.resolve(workspaceId);
                
                if (Files.exists(workspaceDir) && Files.isDirectory(workspaceDir)) {
                    try (Stream<Path> stream = Files.list(workspaceDir)) {
                        return stream
                                .filter(p -> p.getFileName().toString().startsWith(attachmentId))
                                .findFirst()
                                .orElseThrow(() -> new BadRequestException("File not found for identifier: " + fileIdentifier));
                    } catch (IOException e) {
                        throw new BadRequestException("Error searching for file: " + fileIdentifier);
                    }
                }
            }
            throw new BadRequestException("Could not parse legacy identifier: " + fileIdentifier);
        }
        throw new BadRequestException("Unknown file identifier format: " + fileIdentifier);
    }
}
