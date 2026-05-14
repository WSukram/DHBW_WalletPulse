package de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record UserResponse(
        @Schema(description = "User email address", example = "john.doe@example.com")
        String email,
        @Schema(description = "First name", example = "John")
        String firstName,
        @Schema(description = "Last name", example = "Doe")
        String lastName,
        @Schema(description = "Preferred display currency", example = "EUR")
        String preferredCurrency,
        @Schema(description = "Preferred UI theme", example = "dark")
        String preferredTheme
) {}
