package com.startuphub.backend.repository;

import com.startuphub.backend.entity.todo.TodoTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TodoTaskRepository extends JpaRepository<TodoTask, Long> {
    List<TodoTask> findAllByUserId(Long userId);
    Optional<TodoTask> findByUuidAndUserId(UUID uuid, Long userId);
}
