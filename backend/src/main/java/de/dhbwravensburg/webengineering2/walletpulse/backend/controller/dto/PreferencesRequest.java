package de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record PreferencesRequest(
        @Schema(description = "Preferred display currency", example = "EUR")
        @NotBlank String currency,
        @Schema(description = "Preferred UI theme", example = "dark")
        @NotBlank String theme
) {}
