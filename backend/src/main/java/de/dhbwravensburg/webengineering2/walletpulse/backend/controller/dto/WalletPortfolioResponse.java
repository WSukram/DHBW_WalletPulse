package de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

public record WalletPortfolioResponse(
        @Schema(description = "Wallet ID", example = "1")
        Long id,
        @Schema(description = "Name der Wallet", example = "Mein Krypto-Portfolio")
        String name,
        @Schema(description = "Gesamtinvestition über alle Assets (in Euro)", example = "50000.0")
        Double totalInvested,
        @Schema(description = "Gesamtwert aller Assets basierend auf aktuellen Preisen (in Euro)", example = "65000.0")
        Double totalCurrentValue,
        @Schema(description = "Gesamtgewinn oder -verlust (in Euro)", example = "15000.0")
        Double totalProfit,
        @Schema(description = "Details zu den einzelnen Assets")
        List<AssetResponse> assets
) {
}

