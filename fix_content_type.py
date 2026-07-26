import re

with open('/Users/adithya/Developer/SYNERGi/backend/src/main/java/com/startuphub/backend/controller/ChatController.java', 'r') as f:
    content = f.read()

old_code = """        String contentType = "application/octet-stream";
        try {
            String probed = java.nio.file.Files.probeContentType(java.nio.file.Paths.get(resource.getFile().getAbsolutePath()));
            if (probed != null) {
                contentType = probed;
            }
        } catch (java.io.IOException e) {
            // fallback if file can't be resolved properly
            String filename = resource.getFilename();
            if (filename != null) {
                if (filename.toLowerCase().endsWith(".png")) contentType = "image/png";
                else if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) contentType = "image/jpeg";
                else if (filename.toLowerCase().endsWith(".webp")) contentType = "image/webp";
                else if (filename.toLowerCase().endsWith(".pdf")) contentType = "application/pdf";
                else if (filename.toLowerCase().endsWith(".webm")) contentType = "audio/webm";
                else if (filename.toLowerCase().endsWith(".mp4")) contentType = "audio/mp4";
                else if (filename.toLowerCase().endsWith(".ogg")) contentType = "audio/ogg";
                else if (filename.toLowerCase().endsWith(".mp3")) contentType = "audio/mpeg";
            }
        }"""

new_code = """        String contentType = "application/octet-stream";
        String filename = resource.getFilename();
        if (filename != null) {
            String lower = filename.toLowerCase();
            if (lower.endsWith(".png")) contentType = "image/png";
            else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) contentType = "image/jpeg";
            else if (lower.endsWith(".webp")) contentType = "image/webp";
            else if (lower.endsWith(".pdf")) contentType = "application/pdf";
            else if (lower.endsWith(".webm")) contentType = "audio/webm";
            else if (lower.endsWith(".mp4") && lower.startsWith("voice_note")) contentType = "audio/mp4";
            else if (lower.endsWith(".mp4")) contentType = "video/mp4";
            else if (lower.endsWith(".ogg")) contentType = "audio/ogg";
            else if (lower.endsWith(".mp3")) contentType = "audio/mpeg";
            else {
                try {
                    String probed = java.nio.file.Files.probeContentType(java.nio.file.Paths.get(resource.getFile().getAbsolutePath()));
                    if (probed != null && !probed.isEmpty()) {
                        contentType = probed;
                    }
                } catch (java.io.IOException ignored) {}
            }
        }"""

if old_code in content:
    with open('/Users/adithya/Developer/SYNERGi/backend/src/main/java/com/startuphub/backend/controller/ChatController.java', 'w') as f:
        f.write(content.replace(old_code, new_code))
    print("Fixed ChatController")
else:
    print("Could not find old_code")
