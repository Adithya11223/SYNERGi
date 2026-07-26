package com.startuphub.backend.controller;

import com.startuphub.backend.dto.TodoCategoryDto;
import com.startuphub.backend.dto.TodoTaskDto;
import com.startuphub.backend.security.CustomUserDetails;
import com.startuphub.backend.service.TodoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/todos")
@RequiredArgsConstructor
public class TodoController {

    private final TodoService todoService;

    @GetMapping
    public ResponseEntity<List<TodoTaskDto>> getAllTasks(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(todoService.getAllTasks(userDetails.getUser().getId()));
    }

    @PostMapping
    public ResponseEntity<TodoTaskDto> createTask(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody TodoTaskDto dto) {
        return ResponseEntity.ok(todoService.createTask(userDetails.getUser().getId(), dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TodoTaskDto> updateTask(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id,
            @RequestBody TodoTaskDto dto) {
        return ResponseEntity.ok(todoService.updateTask(userDetails.getUser().getId(), id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id) {
        todoService.deleteTask(userDetails.getUser().getId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/categories")
    public ResponseEntity<List<TodoCategoryDto>> getAllCategories(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(todoService.getAllCategories(userDetails.getUser().getId()));
    }

    @PostMapping("/categories")
    public ResponseEntity<TodoCategoryDto> createCategory(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody TodoCategoryDto dto) {
        return ResponseEntity.ok(todoService.createCategory(userDetails.getUser().getId(), dto));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<TodoCategoryDto> updateCategory(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id,
            @RequestBody TodoCategoryDto dto) {
        return ResponseEntity.ok(todoService.updateCategory(userDetails.getUser().getId(), id, dto));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id) {
        todoService.deleteCategory(userDetails.getUser().getId(), id);
        return ResponseEntity.noContent().build();
    }
}
