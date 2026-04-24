package de.dhbwravensburg.webengineering2.walletpulse.backend.controller;

import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Wallet;
import de.dhbwravensburg.webengineering2.walletpulse.backend.service.WalletService;
import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.WalletPortfolioResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
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
    public List<Wallet> getAllWallets(){
        return walletService.getAllWallets();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Eine Wallet per ID abrufen")
    public Wallet getWalletById(@PathVariable Long id) {
        return walletService.getWalletById(id);
    }

    @GetMapping("/{id}/portfolio")
    @Operation(summary = "Gibt das komplette Portfolio einer Wallet inkl. Berechnungen aus")
    public WalletPortfolioResponse getWalletPortfolio(@PathVariable Long id) {
        return walletService.getWalletPortfolio(id);
    }

    @PostMapping
    @Operation(summary = "Neue Wallet anlegen")
    public Wallet createWallet(@Valid @RequestBody Wallet wallet) {
        return walletService.createWallet(wallet);
    }

    @PutMapping("/{id}")
    public Wallet updateWallet(
            @PathVariable Long id,
            @Valid @RequestBody Wallet updatedWallet) {

        return walletService.updateWallet(id, updatedWallet);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteWallet(@PathVariable Long id) {
        walletService.deleteWallet(id);
    }



}
