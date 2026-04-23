package de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto;

public record AssetResponse(
        Long id,
        String coinId,
        Long walletId
) {
}

