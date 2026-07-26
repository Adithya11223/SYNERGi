package com.startuphub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TodoTaskDto {
    private String id;
    private String title;
    private String description;
    private String status;
    private String priority;
    private String categoryId;
    private List<String> tags;
    private String dueDate; // ISO format string
    private String createdAt; // ISO format string
    private List<TodoSubtaskDto> subtasks;
}
