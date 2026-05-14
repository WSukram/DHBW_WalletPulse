package de.dhbwravensburg.webengineering2.walletpulse.backend.controller;

import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.ErrorResponse;
import de.dhbwravensburg.webengineering2.walletpulse.backend.service.BlockchainImportService;
import de.dhbwravensburg.webengineering2.walletpulse.backend.service.blockchain.ImportResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wallets")
@Tag(name = "Import", description = "Import on-chain transaction history for ETH, BTC and SOL wallets")
@SecurityRequirement(name = "bearerAuth")
public class ImportController {

    private final BlockchainImportService blockchainImportService;

    public ImportController(BlockchainImportService blockchainImportService) {
        this.blockchainImportService = blockchainImportService;
    }

    @PostMapping("/{id}/import")
    @Operation(
            summary = "Import on-chain transactions for a wallet address",
            description = "Fetches the wallet's transaction history from the configured chain explorer " +
                    "(Etherscan, Blockstream or Helius), deduplicates by transaction hash, resolves the " +
                    "EUR price at the time of each transaction, and stores the new entries. " +
                    "Returns counts of imported, skipped and failed transactions."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Import completed; result counts returned"),
            @ApiResponse(responseCode = "400", description = "Wallet has no chain address configured",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Wallet not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Unexpected error contacting the upstream chain API",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ImportResult importWallet(
            @Parameter(description = "Wallet ID", example = "1") @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        return blockchainImportService.importWallet(id, user.getUsername());
    }
}
