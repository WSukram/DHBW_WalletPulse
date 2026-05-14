package de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @Schema(description = "First name", example = "Markus")
        @NotBlank String firstName,
        @Schema(description = "Last name", example = "Wenninger")
        @NotBlank String lastName,
        @Schema(description = "Email address (used as login)", example = "user@example.com")
        @Email @NotBlank String email,
        @Schema(description = "Password (minimum 8 characters)", example = "secret1234")
        @NotBlank @Size(min = 8) String password
) {}
