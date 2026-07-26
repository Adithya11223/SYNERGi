package com.startuphub.backend.service;

import com.startuphub.backend.dto.NoteDto;
import com.startuphub.backend.dto.NoteFolderDto;
import com.startuphub.backend.entity.User;
import com.startuphub.backend.entity.notes.Note;
import com.startuphub.backend.entity.notes.NoteFolder;
import com.startuphub.backend.exception.ResourceNotFoundException;
import com.startuphub.backend.repository.NoteFolderRepository;
import com.startuphub.backend.repository.NoteRepository;
import com.startuphub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository noteRepository;
    private final NoteFolderRepository noteFolderRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<NoteDto> getAllNotes(Long userId) {
        return noteRepository.findAllByUserId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NoteFolderDto> getAllFolders(Long userId) {
        return noteFolderRepository.findAllByUserId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public NoteDto createNote(Long userId, NoteDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Note note = Note.builder()
                .user(user)
                .title(dto.getTitle())
                .content(dto.getContent())
                .folderId(dto.getFolderId() != null ? UUID.fromString(dto.getFolderId()) : null)
                .tags(dto.getTags() != null ? new java.util.HashSet<>(dto.getTags()) : new java.util.HashSet<>())
                .isPinned(dto.isPinned())
                .isLocked(dto.isLocked())
                .password(dto.getPassword())
                .isFavorite(dto.isFavorite())
                .status(dto.getStatus() != null ? dto.getStatus() : "draft")
                .build();

        if (dto.getId() != null) {
            note.setUuid(UUID.fromString(dto.getId()));
        }

        return mapToDto(noteRepository.save(note));
    }

    @Transactional
    public NoteDto updateNote(Long userId, String uuidStr, NoteDto dto) {
        UUID uuid = UUID.fromString(uuidStr);
        Note note = noteRepository.findByUuidAndUserId(uuid, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found"));

        if (dto.getTitle() != null) note.setTitle(dto.getTitle());
        if (dto.getContent() != null) note.setContent(dto.getContent());
        if (dto.getFolderId() != null) note.setFolderId(UUID.fromString(dto.getFolderId()));
        if (dto.getTags() != null) note.setTags(new java.util.HashSet<>(dto.getTags()));
        note.setPinned(dto.isPinned());
        note.setLocked(dto.isLocked());
        if (dto.getPassword() != null) note.setPassword(dto.getPassword());
        note.setFavorite(dto.isFavorite());
        if (dto.getStatus() != null) note.setStatus(dto.getStatus());

        return mapToDto(noteRepository.save(note));
    }

    @Transactional
    public void deleteNote(Long userId, String uuidStr) {
        UUID uuid = UUID.fromString(uuidStr);
        Note note = noteRepository.findByUuidAndUserId(uuid, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found"));
        noteRepository.delete(note);
    }

    @Transactional
    public NoteFolderDto createFolder(Long userId, NoteFolderDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        NoteFolder folder = NoteFolder.builder()
                .user(user)
                .name(dto.getName())
                .parentId(dto.getParentId() != null ? UUID.fromString(dto.getParentId()) : null)
                .icon(dto.getIcon())
                .build();

        if (dto.getId() != null) {
            folder.setUuid(UUID.fromString(dto.getId()));
        }

        return mapToDto(noteFolderRepository.save(folder));
    }

    @Transactional
    public NoteFolderDto updateFolder(Long userId, String uuidStr, NoteFolderDto dto) {
        UUID uuid = UUID.fromString(uuidStr);
        NoteFolder folder = noteFolderRepository.findByUuidAndUserId(uuid, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));

        if (dto.getName() != null) folder.setName(dto.getName());
        if (dto.getParentId() != null) folder.setParentId(UUID.fromString(dto.getParentId()));
        if (dto.getIcon() != null) folder.setIcon(dto.getIcon());

        return mapToDto(noteFolderRepository.save(folder));
    }

    @Transactional
    public void deleteFolder(Long userId, String uuidStr) {
        UUID uuid = UUID.fromString(uuidStr);
        NoteFolder folder = noteFolderRepository.findByUuidAndUserId(uuid, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));
        noteFolderRepository.delete(folder);
    }

    private NoteDto mapToDto(Note note) {
        return NoteDto.builder()
                .id(note.getUuid().toString())
                .title(note.getTitle())
                .content(note.getContent())
                .folderId(note.getFolderId() != null ? note.getFolderId().toString() : null)
                .tags(new java.util.ArrayList<>(note.getTags()))
                .createdAt(note.getCreatedAt())
                .updatedAt(note.getUpdatedAt())
                .isPinned(note.isPinned())
                .isLocked(note.isLocked())
                .password(note.getPassword())
                .isFavorite(note.isFavorite())
                .status(note.getStatus())
                .build();
    }

    private NoteFolderDto mapToDto(NoteFolder folder) {
        return NoteFolderDto.builder()
                .id(folder.getUuid().toString())
                .name(folder.getName())
                .parentId(folder.getParentId() != null ? folder.getParentId().toString() : null)
                .icon(folder.getIcon())
                .build();
    }
}
