package de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record AssetResponse(
        @Schema(description = "Asset ID", example = "10")
        Long id,
        @Schema(description = "CoinGecko coin ID", example = "bitcoin")
        String coinId,
        @Schema(description = "ID of the associated wallet", example = "1")
        Long walletId,
        @Schema(description = "Total amount of this coin held in the portfolio", example = "0.5")
        Double totalAmount,
        @Schema(description = "Total amount invested in this coin (in EUR)", example = "25000.0")
        Double totalInvested,
        @Schema(description = "Current market price per unit (in EUR)", example = "60000.0")
        Double currentPrice,
        @Schema(description = "Total current value of this coin based on live price (in EUR)", example = "30000.0")
        Double currentValue,
        @Schema(description = "Profit or loss (in EUR)", example = "5000.0")
        Double profit
) {
}
