package de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto;

import jakarta.validation.constraints.NotBlank;

public record PreferencesRequest(
        @NotBlank String currency,
        @NotBlank String theme
) {}
