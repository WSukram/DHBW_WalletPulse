package de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto;

import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.ChainType;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

public record WalletResponse(
        @Schema(description = "Wallet ID", example = "1")
        Long id,
        @Schema(description = "Wallet display name", example = "My Bitcoin Wallet")
        String name,
        @Schema(description = "Blockchain type (only set if the wallet is linked to an on-chain address)", nullable = true)
        ChainType chainType,
        @Schema(description = "On-chain address (only set if the wallet is linked)", nullable = true, example = "0xABC123...")
        String chainAddress,
        @Schema(description = "Timestamp of the last successful on-chain import", nullable = true)
        LocalDateTime lastImportTime
) {}
