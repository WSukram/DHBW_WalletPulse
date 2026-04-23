package de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto;

import jakarta.validation.constraints.NotBlank;

public record AssetRequest(
        @NotBlank(message = "Coin id must not be blank")
        String coinId
) {
}

