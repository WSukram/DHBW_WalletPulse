package de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

public record WalletPortfolioResponse(
        @Schema(description = "Wallet ID", example = "1")
        Long id,
        @Schema(description = "Wallet display name", example = "My Crypto Portfolio")
        String name,
        @Schema(description = "Total amount invested across all assets (in EUR)", example = "50000.0")
        Double totalInvested,
        @Schema(description = "Total current value of all assets based on live prices (in EUR)", example = "65000.0")
        Double totalCurrentValue,
        @Schema(description = "Total profit or loss (in EUR)", example = "15000.0")
        Double totalProfit,
        @Schema(description = "Individual asset details")
        List<AssetResponse> assets
) {
}

