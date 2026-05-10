package de.dhbwravensburg.webengineering2.walletpulse.backend.controller;

import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Wallet;
import de.dhbwravensburg.webengineering2.walletpulse.backend.service.WalletService;
import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.WalletPortfolioResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wallets")
@Tag(name = "Wallets", description = "CRUD-Endpunkte für Wallets")
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
    @Operation(summary = "Eine Wallet per ID abrufen")
    public Wallet getWalletById(@PathVariable Long id, @AuthenticationPrincipal UserDetails user) {
        return walletService.getWalletById(id, user.getUsername());
    }

    @GetMapping("/{id}/portfolio")
    @Operation(summary = "Gibt das komplette Portfolio einer Wallet inkl. Berechnungen aus")
    public WalletPortfolioResponse getWalletPortfolio(@PathVariable Long id, @AuthenticationPrincipal UserDetails user) {
        return walletService.getWalletPortfolio(id, user.getUsername());
    }

    @PostMapping
    @Operation(summary = "Neue Wallet anlegen")
    public Wallet createWallet(@Valid @RequestBody Wallet wallet, @AuthenticationPrincipal UserDetails user) {
        return walletService.createWallet(wallet, user.getUsername());
    }

    @PutMapping("/{id}")
    public Wallet updateWallet(
            @PathVariable Long id,
            @Valid @RequestBody Wallet updatedWallet,
            @AuthenticationPrincipal UserDetails user) {
        return walletService.updateWallet(id, updatedWallet, user.getUsername());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteWallet(@PathVariable Long id, @AuthenticationPrincipal UserDetails user) {
        walletService.deleteWallet(id, user.getUsername());
    }
}
