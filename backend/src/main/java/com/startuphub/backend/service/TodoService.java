package com.startuphub.backend.service;

import com.startuphub.backend.dto.TodoCategoryDto;
import com.startuphub.backend.dto.TodoSubtaskDto;
import com.startuphub.backend.dto.TodoTaskDto;
import com.startuphub.backend.entity.User;
import com.startuphub.backend.entity.todo.TodoCategory;
import com.startuphub.backend.entity.todo.TodoSubtask;
import com.startuphub.backend.entity.todo.TodoTask;
import com.startuphub.backend.exception.ResourceNotFoundException;
import com.startuphub.backend.repository.TodoCategoryRepository;
import com.startuphub.backend.repository.TodoTaskRepository;
import com.startuphub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TodoService {

    private final TodoTaskRepository taskRepository;
    private final TodoCategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<TodoTaskDto> getAllTasks(Long userId) {
        return taskRepository.findAllByUserId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TodoCategoryDto> getAllCategories(Long userId) {
        return categoryRepository.findAllByUserId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public TodoTaskDto createTask(Long userId, TodoTaskDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        TodoTask task = TodoTask.builder()
                .user(user)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .status(dto.getStatus() != null ? dto.getStatus() : "TODO")
                .priority(dto.getPriority() != null ? dto.getPriority() : "MEDIUM")
                .categoryId(dto.getCategoryId() != null ? UUID.fromString(dto.getCategoryId()) : null)
                .tags(dto.getTags() != null ? new java.util.HashSet<>(dto.getTags()) : new java.util.HashSet<>())
                .dueDate(dto.getDueDate() != null ? LocalDateTime.parse(dto.getDueDate(), DateTimeFormatter.ISO_DATE_TIME) : null)
                .build();
                
        if (dto.getId() != null) {
            task.setUuid(UUID.fromString(dto.getId()));
        }

        if (dto.getSubtasks() != null) {
            List<TodoSubtask> subtasks = dto.getSubtasks().stream().map(subDto -> {
                TodoSubtask subtask = TodoSubtask.builder()
                        .task(task)
                        .title(subDto.getTitle())
                        .completed(subDto.isCompleted())
                        .build();
                if (subDto.getId() != null) {
                    subtask.setUuid(UUID.fromString(subDto.getId()));
                }
                return subtask;
            }).collect(Collectors.toList());
            task.setSubtasks(subtasks);
        }

        return mapToDto(taskRepository.save(task));
    }

    @Transactional
    public TodoTaskDto updateTask(Long userId, String uuidStr, TodoTaskDto dto) {
        UUID uuid = UUID.fromString(uuidStr);
        TodoTask task = taskRepository.findByUuidAndUserId(uuid, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (dto.getTitle() != null) task.setTitle(dto.getTitle());
        if (dto.getDescription() != null) task.setDescription(dto.getDescription());
        if (dto.getStatus() != null) task.setStatus(dto.getStatus());
        if (dto.getPriority() != null) task.setPriority(dto.getPriority());
        if (dto.getCategoryId() != null) task.setCategoryId(UUID.fromString(dto.getCategoryId()));
        if (dto.getTags() != null) task.setTags(new java.util.HashSet<>(dto.getTags()));
        if (dto.getDueDate() != null) {
            task.setDueDate(LocalDateTime.parse(dto.getDueDate(), DateTimeFormatter.ISO_DATE_TIME));
        }

        if (dto.getSubtasks() != null) {
            task.getSubtasks().clear();
            List<TodoSubtask> subtasks = dto.getSubtasks().stream().map(subDto -> {
                TodoSubtask subtask = TodoSubtask.builder()
                        .task(task)
                        .title(subDto.getTitle())
                        .completed(subDto.isCompleted())
                        .build();
                if (subDto.getId() != null) {
                    subtask.setUuid(UUID.fromString(subDto.getId()));
                }
                return subtask;
            }).collect(Collectors.toList());
            task.getSubtasks().addAll(subtasks);
        }

        return mapToDto(taskRepository.save(task));
    }

    @Transactional
    public void deleteTask(Long userId, String uuidStr) {
        UUID uuid = UUID.fromString(uuidStr);
        TodoTask task = taskRepository.findByUuidAndUserId(uuid, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        taskRepository.delete(task);
    }

    @Transactional
    public TodoCategoryDto createCategory(Long userId, TodoCategoryDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        TodoCategory category = TodoCategory.builder()
                .user(user)
                .name(dto.getName())
                .color(dto.getColor())
                .build();
                
        if (dto.getId() != null && dto.getId().length() > 20) {
            try {
                category.setUuid(UUID.fromString(dto.getId()));
            } catch(Exception e) {}
        }

        return mapToDto(categoryRepository.save(category));
    }

    @Transactional
    public TodoCategoryDto updateCategory(Long userId, String uuidStr, TodoCategoryDto dto) {
        UUID uuid = UUID.fromString(uuidStr);
        TodoCategory category = categoryRepository.findByUuidAndUserId(uuid, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (dto.getName() != null) category.setName(dto.getName());
        if (dto.getColor() != null) category.setColor(dto.getColor());

        return mapToDto(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long userId, String uuidStr) {
        UUID uuid = UUID.fromString(uuidStr);
        TodoCategory category = categoryRepository.findByUuidAndUserId(uuid, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        categoryRepository.delete(category);
    }

    private TodoTaskDto mapToDto(TodoTask task) {
        return TodoTaskDto.builder()
                .id(task.getUuid().toString())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .categoryId(task.getCategoryId() != null ? task.getCategoryId().toString() : null)
                .tags(new java.util.ArrayList<>(task.getTags()))
                .dueDate(task.getDueDate() != null ? task.getDueDate().format(DateTimeFormatter.ISO_DATE_TIME) : null)
                .createdAt(task.getCreatedAt() != null ? task.getCreatedAt().format(DateTimeFormatter.ISO_DATE_TIME) : null)
                .subtasks(task.getSubtasks().stream().map(sub -> TodoSubtaskDto.builder()
                        .id(sub.getUuid().toString())
                        .title(sub.getTitle())
                        .completed(sub.isCompleted())
                        .build()).collect(Collectors.toList()))
                .build();
    }

    private TodoCategoryDto mapToDto(TodoCategory category) {
        return TodoCategoryDto.builder()
                .id(category.getUuid().toString())
                .name(category.getName())
                .color(category.getColor())
                .build();
    }
}
