package de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @Schema(description = "First name", example = "John")
        @NotBlank String firstName,
        @Schema(description = "Last name", example = "Doe")
        @NotBlank String lastName,
        @Schema(description = "Email address (used as login)", example = "john.doe@example.com")
        @Email @NotBlank String email,
        @Schema(description = "Password (12-72 characters; BCrypt truncates beyond 72 bytes)", example = "secret1234!!")
        @NotBlank @Size(min = 12, max = 72) String password
) {}
