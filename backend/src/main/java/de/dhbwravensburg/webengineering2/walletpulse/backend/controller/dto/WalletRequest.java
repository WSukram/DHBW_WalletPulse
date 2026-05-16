package de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto;

import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.ChainType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;

public record WalletRequest(
        @Schema(description = "Wallet display name", example = "My Bitcoin Wallet")
        @NotBlank(message = "Wallet name must not be blank")
        String name,

        @Schema(description = "Blockchain type (ETH, BTC, SOL) – optional, but must be set together with chainAddress")
        ChainType chainType,

        @Schema(description = "On-chain address – optional, but must be set together with chainType")
        String chainAddress
) {
    @AssertTrue(message = "chainType and chainAddress must both be set or both be empty")
    public boolean isChainFieldsConsistent() {
        boolean hasType = chainType != null;
        boolean hasAddress = chainAddress != null && !chainAddress.isBlank();
        return hasType == hasAddress;
    }

    @AssertTrue(message = "chainAddress format is invalid for the given chainType")
    public boolean isChainAddressValid() {
        if (chainType == null || chainAddress == null || chainAddress.isBlank()) return true;
        return switch (chainType) {
            case ETH -> chainAddress.matches("^0x[a-fA-F0-9]{40}$");
            case BTC -> chainAddress.matches("^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$");
            case SOL -> chainAddress.matches("^[1-9A-HJ-NP-Za-km-z]{32,44}$");
        };
    }
}
