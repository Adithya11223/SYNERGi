package com.startuphub.backend.repository;

import com.startuphub.backend.entity.notes.NoteFolder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NoteFolderRepository extends JpaRepository<NoteFolder, Long> {
    List<NoteFolder> findAllByUserId(Long userId);
    Optional<NoteFolder> findByUuidAndUserId(UUID uuid, Long userId);
}
