package com.startuphub.backend.repository;

import com.startuphub.backend.entity.todo.TodoCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TodoCategoryRepository extends JpaRepository<TodoCategory, Long> {
    List<TodoCategory> findAllByUserId(Long userId);
    Optional<TodoCategory> findByUuidAndUserId(UUID uuid, Long userId);
}
