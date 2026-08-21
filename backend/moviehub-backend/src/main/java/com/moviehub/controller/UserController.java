package com.moviehub.controller;

import com.moviehub.entity.User;
import com.moviehub.exception.ResourceNotFoundException;
import com.moviehub.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmail(@RequestParam String email) {
        return ResponseEntity.ok(userService.emailExists(email));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> profile(Authentication authentication) {

        String email = authentication.getName();

        User user = userService.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        return ResponseEntity.ok(
                new ProfileResponse(
                        user.getId(),
                        user.getUsername(),
                        user.getEmail(),
                        user.getRole().name()
                )
        );
    }

    public record ProfileResponse(
            Long id,
            String username,
            String email,
            String role
    ) {}

    @GetMapping("/admin-test")
    public ResponseEntity<String> adminTest() {
        return ResponseEntity.ok("Admin access granted");
    }


}