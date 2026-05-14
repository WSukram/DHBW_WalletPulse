package de.dhbwravensburg.webengineering2.walletpulse.backend.controller;

import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Wallet;
import de.dhbwravensburg.webengineering2.walletpulse.backend.service.WalletService;
import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.WalletPortfolioResponse;
import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.WalletRequest;
import io.swagger.v3.oas.annotations.Operation;
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
    public List<Wallet> getAllWallets(@AuthenticationPrincipal UserDetails user) {
        return walletService.getAllWallets(user.getUsername());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a wallet by ID")
    public Wallet getWalletById(@PathVariable Long id, @AuthenticationPrincipal UserDetails user) {
        return walletService.getWalletById(id, user.getUsername());
    }

    @GetMapping("/{id}/portfolio")
    @Operation(summary = "Get the full portfolio of a wallet including calculated totals")
    public WalletPortfolioResponse getWalletPortfolio(@PathVariable Long id, @AuthenticationPrincipal UserDetails user) {
        return walletService.getWalletPortfolio(id, user.getUsername());
    }

    @PostMapping
    @Operation(summary = "Create a new wallet")
    public Wallet createWallet(@Valid @RequestBody WalletRequest req, @AuthenticationPrincipal UserDetails user) {
        Wallet wallet = new Wallet();
        wallet.setName(req.name());
        wallet.setChainType(req.chainType());
        wallet.setChainAddress(req.chainAddress());
        return walletService.createWallet(wallet, user.getUsername());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing wallet")
    public Wallet updateWallet(
            @PathVariable Long id,
            @Valid @RequestBody WalletRequest req,
            @AuthenticationPrincipal UserDetails user) {
        Wallet updatedWallet = new Wallet();
        updatedWallet.setName(req.name());
        updatedWallet.setChainType(req.chainType());
        updatedWallet.setChainAddress(req.chainAddress());
        return walletService.updateWallet(id, updatedWallet, user.getUsername());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteWallet(@PathVariable Long id, @AuthenticationPrincipal UserDetails user) {
        walletService.deleteWallet(id, user.getUsername());
    }
}
