package de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.LocalDate;

public record TransactionRequest(
        @Schema(description = "Amount of the coin", example = "0.5")
        @Positive(message = "Amount must be greater than zero")
        double amount,
        @Schema(description = "Purchase price per coin in EUR", example = "58000")
        @PositiveOrZero(message = "Buy price must be zero or greater")
        double buyPrice,
        @Schema(description = "Purchase date", example = "2026-04-24")
        @NotNull(message = "Date must not be null")
        LocalDate date
) {
}

