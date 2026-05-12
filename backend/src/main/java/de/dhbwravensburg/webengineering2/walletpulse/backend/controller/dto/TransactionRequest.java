package de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public record TransactionRequest(
        @Schema(description = "Menge des Coins", example = "0.5")
        @Positive(message = "Amount must be greater than zero")
        double amount,
        @Schema(description = "Kaufpreis pro Coin", example = "58000")
        @Positive(message = "Buy price must be greater than zero")
        double buyPrice,
        @Schema(description = "Kaufdatum", example = "2026-04-24")
        @NotNull(message = "Date must not be null")
        LocalDate date
) {
}

