package de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto;

import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.TransactionSource;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;

public record TransactionResponse(
        @Schema(description = "Transaction ID", example = "100")
        Long id,
        @Schema(description = "ID of the associated asset", example = "10")
        Long assetId,
        @Schema(description = "Amount of the coin", example = "0.5")
        double amount,
        @Schema(description = "Purchase price per coin in EUR", example = "58000")
        double buyPrice,
        @Schema(description = "Purchase date", example = "2026-04-24")
        LocalDate date,
        @Schema(description = "Transaction source", example = "MANUAL")
        TransactionSource source,
        @Schema(description = "Blockchain transaction hash (only set for imported transactions)", nullable = true)
        String txHash
) {
}
