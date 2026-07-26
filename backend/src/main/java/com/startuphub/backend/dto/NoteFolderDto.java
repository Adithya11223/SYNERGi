package com.startuphub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoteFolderDto {
    private String id;
    private String name;
    private String parentId;
    private String icon;
}
