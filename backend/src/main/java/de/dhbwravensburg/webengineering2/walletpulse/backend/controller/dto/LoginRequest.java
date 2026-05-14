package de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @Schema(description = "Registered email address", example = "john.doe@example.com")
        @Email @NotBlank String email,
        @Schema(description = "Account password", example = "secret1234")
        @NotBlank String password
) {}
