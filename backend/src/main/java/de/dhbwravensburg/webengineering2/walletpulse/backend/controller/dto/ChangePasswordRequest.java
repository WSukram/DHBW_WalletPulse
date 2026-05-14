package de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
        @Schema(description = "Current password", example = "oldSecret1234")
        @NotBlank String currentPassword,
        @Schema(description = "New password (minimum 8 characters)", example = "newSecret1234")
        @NotBlank @Size(min = 8) String newPassword
) {}
