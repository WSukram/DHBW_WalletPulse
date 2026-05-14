package de.dhbwravensburg.webengineering2.walletpulse.backend.controller;

import de.dhbwravensburg.webengineering2.walletpulse.backend.service.BlockchainImportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wallets")
@Tag(name = "Import", description = "Blockchain wallet import")
@SecurityRequirement(name = "bearerAuth")
public class ImportController {

    private final BlockchainImportService blockchainImportService;

    public ImportController(BlockchainImportService blockchainImportService) {
        this.blockchainImportService = blockchainImportService;
    }

    @PostMapping("/{id}/import")
    @Operation(summary = "Import on-chain transactions for a wallet address")
    public BlockchainImportService.ImportResult importWallet(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        return blockchainImportService.importWallet(id, user.getUsername());
    }
}
