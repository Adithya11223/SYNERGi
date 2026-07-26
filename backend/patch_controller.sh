cat << 'INNER_EOF' > /tmp/patch_controller.java
    @PostMapping("/delivered/all")
    public ResponseEntity<ApiResponse<String>> markAllAsDelivered(
            @PathVariable UUID startupUuid,
            Authentication authentication) {
        chatMessageService.markAllAsDelivered(authentication.getName(), startupUuid);
        return ResponseEntity.ok(ApiResponse.success(
                "OK",
                "All unread messages marked as delivered"
        ));
    }
INNER_EOF
sed -i.bak '/public ResponseEntity<ApiResponse<ReadReceiptResponse>> markAsRead(/r /tmp/patch_controller.java' /Users/adithya/Developer/SYNERGi/backend/src/main/java/com/startuphub/backend/controller/ChatController.java
