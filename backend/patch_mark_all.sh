cat << 'INNER_EOF' > /tmp/patch_mark_all.java
    @Transactional
    public void markAllAsDelivered(String clerkId, UUID startupUuid) {
        User user = getUserByClerkId(clerkId);
        Startup startup = getStartup(startupUuid);
        checkWorkspaceAccess(startup, user);

        List<ChatRoom> rooms = chatRoomRepository.findByStartupId(startup.getId());
        List<ChatRoom> userRooms = rooms.stream()
                .filter(r -> r.getMembers().stream().anyMatch(m -> m.getUser().getId().equals(user.getId())))
                .collect(Collectors.toList());

        for (ChatRoom room : userRooms) {
            MessageReadReceipt receipt = messageReadReceiptRepository.findByRoomAndUser(room, user).orElse(null);
            java.time.LocalDateTime readWatermark = receipt != null && receipt.getLastReadMessage() != null 
                    ? receipt.getLastReadMessage().getCreatedAt() 
                    : java.time.LocalDateTime.MIN;
            
            List<ChatMessage> unreadMessages = chatMessageRepository.findByRoom(room).stream()
                .filter(m -> !m.getSender().getId().equals(user.getId()))
                .filter(m -> m.getCreatedAt().isAfter(readWatermark))
                .collect(Collectors.toList());

            for (ChatMessage msg : unreadMessages) {
                MessageStatus status = messageStatusRepository.findByMessageAndUser(msg, user).orElse(null);
                if (status == null) {
                    status = MessageStatus.builder()
                            .message(msg)
                            .user(user)
                            .deliveredAt(java.time.LocalDateTime.now())
                            .build();
                } else if (status.getDeliveredAt() == null) {
                    status.setDeliveredAt(java.time.LocalDateTime.now());
                } else {
                    continue; 
                }
                
                try {
                    messageStatusRepository.save(status);
                    
                    String payload = String.format("{\"type\":\"statusUpdate\",\"messageUuid\":\"%s\",\"userUuid\":\"%s\",\"status\":\"DELIVERED\",\"timestamp\":\"%s\"}",
                            msg.getUuid().toString(), user.getUuid().toString(), status.getDeliveredAt().toString());
                    messagingTemplate.convertAndSend("/topic/room." + room.getUuid().toString(), payload);
                } catch (Exception e) {
                    log.warn("Failed to mark delivered for msg {}", msg.getUuid());
                }
            }
        }
    }
INNER_EOF
sed -i.bak '/public void markAsRead(/r /tmp/patch_mark_all.java' /Users/adithya/Developer/SYNERGi/backend/src/main/java/com/startuphub/backend/service/ChatMessageService.java
