package com.startuphub.backend.config;

import com.startuphub.backend.repository.UserRepository;
import com.startuphub.backend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import com.startuphub.backend.listener.UserPresenceListener;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
@Slf4j
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtDecoder jwtDecoder;
    private final UserRepository userRepository;
    @org.springframework.beans.factory.annotation.Autowired
    @org.springframework.context.annotation.Lazy
    private UserPresenceListener userPresenceListener;
    @org.springframework.beans.factory.annotation.Autowired
    @org.springframework.context.annotation.Lazy
    private com.startuphub.backend.security.SubscriptionValidator subscriptionValidator;

    @org.springframework.beans.factory.annotation.Value("${app.websocket.broker.type:simple}")
    private String brokerType;
    @org.springframework.beans.factory.annotation.Value("${app.websocket.broker.relay.host:localhost}")
    private String relayHost;
    @org.springframework.beans.factory.annotation.Value("${app.websocket.broker.relay.port:61613}")
    private int relayPort;
    @org.springframework.beans.factory.annotation.Value("${app.websocket.broker.relay.client-login:guest}")
    private String relayClientLogin;
    @org.springframework.beans.factory.annotation.Value("${app.websocket.broker.relay.client-passcode:guest}")
    private String relayClientPasscode;
    @org.springframework.beans.factory.annotation.Value("${app.websocket.broker.relay.system-login:guest}")
    private String relaySystemLogin;
    @org.springframework.beans.factory.annotation.Value("${app.websocket.broker.relay.system-passcode:guest}")
    private String relaySystemPasscode;

    // NOTE: Schema cleanup (old columns/tables) must be done via migration scripts,
    // not at application startup. The previous fixDb() method that dropped columns
    // and tables on every boot has been removed to prevent data destruction.

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // We configure SockJS fallback and CORS for frontend connection
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
                
        // Native WebSocket endpoint (no SockJS)
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        if ("relay".equalsIgnoreCase(brokerType)) {
            log.info("Configuring STOMP Broker Relay via {}", relayHost);
            registry.enableStompBrokerRelay("/topic", "/queue")
                    .setRelayHost(relayHost)
                    .setRelayPort(relayPort)
                    .setClientLogin(relayClientLogin)
                    .setClientPasscode(relayClientPasscode)
                    .setSystemLogin(relaySystemLogin)
                    .setSystemPasscode(relaySystemPasscode);
        } else {
            log.info("Configuring In-Memory SimpleBroker");
            registry.enableSimpleBroker("/topic", "/queue");
        }
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor =
                        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authHeader = accessor.getFirstNativeHeader("Authorization");
                    boolean authenticated = false;
                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String token = authHeader.substring(7);
                        try {
                            Jwt jwt = jwtDecoder.decode(token);
                            String clerkId = jwt.getSubject();
                            
                            if (clerkId != null) {
                                userRepository.findByClerkId(clerkId).ifPresent(user -> {
                                    CustomUserDetails userDetails = new CustomUserDetails(user);
                                    UsernamePasswordAuthenticationToken authentication =
                                            new UsernamePasswordAuthenticationToken(
                                                    userDetails, null, userDetails.getAuthorities());
                                    SecurityContextHolder.getContext().setAuthentication(authentication);
                                    accessor.setUser(authentication);
                                    
                                    // Explicitly mark user as online since SessionConnectedEvent might lose the Principal
                                    userPresenceListener.onConnect(user.getClerkId(), accessor.getSessionId());
                                });
                                authenticated = accessor.getUser() != null;
                            }
                        } catch (Exception e) {
                            log.error("WebSocket Authentication Failed: {}", e.getMessage());
                        }
                    }
                    if (!authenticated) {
                        throw new org.springframework.messaging.MessageDeliveryException("Unauthorized STOMP CONNECT");
                    }
                } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                    String destination = accessor.getDestination();
                    java.security.Principal user = accessor.getUser();
                    if (user == null) {
                        throw new org.springframework.messaging.MessageDeliveryException("Unauthorized STOMP SUBSCRIBE");
                    }
                    if (destination != null) {
                        try {
                            subscriptionValidator.validateSubscription(user.getName(), destination);
                        } catch (SecurityException ex) {
                            log.error("WebSocket Subscription Denied: {}", ex.getMessage());
                            throw new org.springframework.messaging.MessageDeliveryException("Unauthorized subscription");
                        }
                    }
                }
                return message;
            }
        });
    }
}
