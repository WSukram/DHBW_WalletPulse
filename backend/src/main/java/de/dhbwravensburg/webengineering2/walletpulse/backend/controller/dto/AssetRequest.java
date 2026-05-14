package de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record AssetRequest(
        @Schema(description = "CoinGecko coin ID, e.g. bitcoin or ethereum", example = "bitcoin")
        @NotBlank(message = "Coin id must not be blank")
        String coinId
) {
}

