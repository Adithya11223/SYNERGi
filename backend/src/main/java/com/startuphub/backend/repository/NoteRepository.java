package com.startuphub.backend.repository;

import com.startuphub.backend.entity.notes.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findAllByUserId(Long userId);
    Optional<Note> findByUuidAndUserId(UUID uuid, Long userId);
}
