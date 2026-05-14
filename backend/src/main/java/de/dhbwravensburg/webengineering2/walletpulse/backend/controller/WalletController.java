package de.dhbwravensburg.webengineering2.walletpulse.backend.controller;

import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.ErrorResponse;
import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.WalletPortfolioResponse;
import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.WalletRequest;
import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.WalletResponse;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Wallet;
import de.dhbwravensburg.webengineering2.walletpulse.backend.service.WalletService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wallets")
@Tag(name = "Wallets", description = "CRUD endpoints for wallets")
@SecurityRequirement(name = "bearerAuth")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping
    @Operation(summary = "List all wallets owned by the current user")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Wallets returned"),
            @ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public List<WalletResponse> getAllWallets(@AuthenticationPrincipal UserDetails user) {
        return walletService.getAllWallets(user.getUsername())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a wallet by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Wallet found"),
            @ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Wallet not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public WalletResponse getWalletById(
            @Parameter(description = "Wallet ID", example = "1") @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        return toResponse(walletService.getWalletById(id, user.getUsername()));
    }

    @GetMapping("/{id}/portfolio")
    @Operation(summary = "Get the full portfolio of a wallet including calculated totals")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Portfolio returned"),
            @ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Wallet not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public WalletPortfolioResponse getWalletPortfolio(
            @Parameter(description = "Wallet ID", example = "1") @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        return walletService.getWalletPortfolio(id, user.getUsername());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new wallet")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Wallet created"),
            @ApiResponse(responseCode = "400", description = "Invalid request body",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public WalletResponse createWallet(@Valid @RequestBody WalletRequest req,
                                       @AuthenticationPrincipal UserDetails user) {
        Wallet wallet = new Wallet();
        wallet.setName(req.name());
        wallet.setChainType(req.chainType());
        wallet.setChainAddress(req.chainAddress());
        return toResponse(walletService.createWallet(wallet, user.getUsername()));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing wallet")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Wallet updated"),
            @ApiResponse(responseCode = "400", description = "Invalid request body",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Wallet not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public WalletResponse updateWallet(
            @Parameter(description = "Wallet ID", example = "1") @PathVariable Long id,
            @Valid @RequestBody WalletRequest req,
            @AuthenticationPrincipal UserDetails user) {
        Wallet updatedWallet = new Wallet();
        updatedWallet.setName(req.name());
        updatedWallet.setChainType(req.chainType());
        updatedWallet.setChainAddress(req.chainAddress());
        return toResponse(walletService.updateWallet(id, updatedWallet, user.getUsername()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a wallet and all of its assets and transactions")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Wallet deleted"),
            @ApiResponse(responseCode = "401", description = "Not authenticated",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Wallet not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public void deleteWallet(
            @Parameter(description = "Wallet ID", example = "1") @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        walletService.deleteWallet(id, user.getUsername());
    }

    private WalletResponse toResponse(Wallet wallet) {
        return new WalletResponse(
                wallet.getId(),
                wallet.getName(),
                wallet.getChainType(),
                wallet.getChainAddress(),
                wallet.getLastImportTime()
        );
    }
}
