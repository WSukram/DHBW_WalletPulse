package de.dhbwravensburg.webengineering2.walletpulse.backend.controller;

import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.AuthResponse;
import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.ErrorResponse;
import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.LoginRequest;
import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.RegisterRequest;
import de.dhbwravensburg.webengineering2.walletpulse.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Register, login, and token refresh")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @SecurityRequirements({})
    @Operation(summary = "Register a new user account", description = "Public endpoint. Creates a new account and returns a JWT.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Registration successful, JWT returned"),
            @ApiResponse(responseCode = "400", description = "Invalid request body or email already in use",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    @SecurityRequirements({})
    @Operation(summary = "Log in and receive a JWT", description = "Public endpoint. Returns a JWT on successful authentication.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Login successful, JWT returned"),
            @ApiResponse(responseCode = "401", description = "Invalid credentials",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Refresh the JWT for the currently authenticated user",
            description = "Requires a valid bearer token. Returns a freshly minted JWT.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "New JWT returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid token",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<AuthResponse> refresh(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(authService.refresh(userDetails.getUsername()));
    }
}
