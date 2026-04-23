package de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record AssetResponse(
        @Schema(description = "Asset ID", example = "10")
        Long id,
        @Schema(description = "Coin Identifier", example = "bitcoin")
        String coinId,
        @Schema(description = "ID der zugehörigen Wallet", example = "1")
        Long walletId
) {
}

