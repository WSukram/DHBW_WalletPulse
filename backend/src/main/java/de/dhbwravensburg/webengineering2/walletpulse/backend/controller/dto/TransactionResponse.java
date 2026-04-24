package de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;

public record TransactionResponse(
        @Schema(description = "Transaction ID", example = "100")
        Long id,
        @Schema(description = "ID des zugehörigen Assets", example = "10")
        Long assetId,
        @Schema(description = "Menge des Coins", example = "0.5")
        double amount,
        @Schema(description = "Kaufpreis pro Coin", example = "58000")
        double buyPrice,
        @Schema(description = "Kaufdatum", example = "2026-04-24")
        LocalDate date
) {
}


