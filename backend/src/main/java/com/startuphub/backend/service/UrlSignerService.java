package com.startuphub.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

@Service
public class UrlSignerService {

    @Value("${app.storage.signature.secret}")
    private String secretKey;

    @Value("${app.storage.signed-url.expiration}")
    private long defaultExpirationSeconds;

    public String signUrl(String path) {
        long expires = Instant.now().getEpochSecond() + defaultExpirationSeconds;
        String signature = generateSignature(path, expires);
        
        String delimiter = path.contains("?") ? "&" : "?";
        return path + delimiter + "expires=" + expires + "&signature=" + signature;
    }

    public boolean validateSignature(String path, long expires, String signature) {
        // Allow up to 30 seconds of clock skew
        if (Instant.now().getEpochSecond() > expires + 30) {
            return false;
        }

        String expectedSignature = generateSignature(path, expires);
        return expectedSignature.equals(signature);
    }

    private String generateSignature(String path, long expires) {
        try {
            String payload = path + "?expires=" + expires;
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hmacBytes = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hmacBytes);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate URL signature", e);
        }
    }
}
