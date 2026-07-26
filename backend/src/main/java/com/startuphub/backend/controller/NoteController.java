package com.startuphub.backend.controller;

import com.startuphub.backend.dto.NoteDto;
import com.startuphub.backend.dto.NoteFolderDto;
import com.startuphub.backend.security.CustomUserDetails;
import com.startuphub.backend.service.NoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;

    @GetMapping
    public ResponseEntity<List<NoteDto>> getAllNotes(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(noteService.getAllNotes(userDetails.getUser().getId()));
    }

    @PostMapping
    public ResponseEntity<NoteDto> createNote(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody NoteDto dto) {
        return ResponseEntity.ok(noteService.createNote(userDetails.getUser().getId(), dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NoteDto> updateNote(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id,
            @RequestBody NoteDto dto) {
        return ResponseEntity.ok(noteService.updateNote(userDetails.getUser().getId(), id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id) {
        noteService.deleteNote(userDetails.getUser().getId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/folders")
    public ResponseEntity<List<NoteFolderDto>> getAllFolders(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(noteService.getAllFolders(userDetails.getUser().getId()));
    }

    @PostMapping("/folders")
    public ResponseEntity<NoteFolderDto> createFolder(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody NoteFolderDto dto) {
        return ResponseEntity.ok(noteService.createFolder(userDetails.getUser().getId(), dto));
    }

    @PutMapping("/folders/{id}")
    public ResponseEntity<NoteFolderDto> updateFolder(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id,
            @RequestBody NoteFolderDto dto) {
        return ResponseEntity.ok(noteService.updateFolder(userDetails.getUser().getId(), id, dto));
    }

    @DeleteMapping("/folders/{id}")
    public ResponseEntity<Void> deleteFolder(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id) {
        noteService.deleteFolder(userDetails.getUser().getId(), id);
        return ResponseEntity.noContent().build();
    }
}
