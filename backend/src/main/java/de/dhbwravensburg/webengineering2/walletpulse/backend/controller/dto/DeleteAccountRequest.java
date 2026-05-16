package de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record DeleteAccountRequest(
        @Schema(description = "Current password to confirm account deletion", example = "secret1234!!")
        @NotBlank String currentPassword
) {}
