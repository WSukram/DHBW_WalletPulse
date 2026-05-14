package de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.Map;

@Schema(description = "Standard error envelope returned by the global exception handler")
public record ErrorResponse(
        @Schema(description = "Human-readable error message (set for non-validation errors)", example = "Wallet with id 42 not found", nullable = true)
        String error,
        @Schema(description = "Field-level validation errors keyed by field name (set for 400 validation errors)", nullable = true, example = "{\"email\": \"must be a valid email\"}")
        Map<String, String> errors
) {}
