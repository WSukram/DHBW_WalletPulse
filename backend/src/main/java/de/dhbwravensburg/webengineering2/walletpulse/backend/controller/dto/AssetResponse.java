package de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record AssetResponse(
        @Schema(description = "Asset ID", example = "10")
        Long id,
        @Schema(description = "Coin Identifier", example = "bitcoin")
        String coinId,
        @Schema(description = "ID der zugehörigen Wallet", example = "1")
        Long walletId,
        @Schema(description = "Total menge dieses Coins im Portfolio", example = "0.5")
        Double totalAmount,
        @Schema(description = "Gesamtinvestition für diesen Coin (in Euro)", example = "25000.0")
        Double totalInvested,
        @Schema(description = "Aktueller Marktwert pro Einheit (in Euro)", example = "60000.0")
        Double currentPrice,
        @Schema(description = "Gesamtwert des Coins basierend auf aktuellem Preis (in Euro)", example = "30000.0")
        Double currentValue,
        @Schema(description = "Gewinn oder Verlust (in Euro)", example = "5000.0")
        Double profit
) {
}

