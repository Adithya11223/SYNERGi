package com.startuphub.backend.config;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.Cookie;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;

public class CustomBearerTokenResolver implements BearerTokenResolver {
    private DefaultBearerTokenResolver defaultResolver = new DefaultBearerTokenResolver();

    @Override
    public String resolve(HttpServletRequest request) {
        String token = defaultResolver.resolve(request);
        if (token == null && request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("__session".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return token;
    }
}
