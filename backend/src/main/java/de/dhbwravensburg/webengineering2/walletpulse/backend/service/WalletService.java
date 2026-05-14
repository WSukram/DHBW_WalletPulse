package de.dhbwravensburg.webengineering2.walletpulse.backend.service;

import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.AssetResponse;
import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.WalletPortfolioResponse;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.User;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Wallet;
import de.dhbwravensburg.webengineering2.walletpulse.backend.exception.ResourceNotFoundException;
import de.dhbwravensburg.webengineering2.walletpulse.backend.repository.UserRepository;
import de.dhbwravensburg.webengineering2.walletpulse.backend.repository.WalletRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * CRUD and portfolio aggregation for wallets. Every method takes the caller's
 * {@code ownerEmail} so that database queries are scoped to the authenticated
 * user — a user can never observe or modify another user's wallets.
 */
@Service
public class WalletService {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final AssetService assetService;

    public WalletService(WalletRepository walletRepository, UserRepository userRepository, AssetService assetService) {
        this.walletRepository = walletRepository;
        this.userRepository = userRepository;
        this.assetService = assetService;
    }

    public List<Wallet> getAllWallets(String ownerEmail) {
        return walletRepository.findAllByOwnerEmail(ownerEmail);
    }

    public Wallet createWallet(Wallet wallet, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail).orElseThrow();
        wallet.setOwner(owner);
        return walletRepository.save(wallet);
    }

    public Wallet getWalletById(Long id, String ownerEmail) {
        return walletRepository.findByIdAndOwnerEmail(id, ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet with id " + id + " not found"));
    }

    public void deleteWallet(Long id, String ownerEmail) {
        Wallet wallet = getWalletById(id, ownerEmail);
        walletRepository.delete(wallet);
    }

    public Wallet updateWallet(Long id, Wallet updatedWallet, String ownerEmail) {
        Wallet existing = getWalletById(id, ownerEmail);
        existing.setName(updatedWallet.getName());
        existing.setChainType(updatedWallet.getChainType());
        existing.setChainAddress(updatedWallet.getChainAddress());
        return walletRepository.save(existing);
    }

    public WalletPortfolioResponse getWalletPortfolio(Long id, String ownerEmail) {
        Wallet wallet = getWalletById(id, ownerEmail);

        List<AssetResponse> assetResponses = wallet.getAssets() == null ? List.of() :
                wallet.getAssets().stream()
                        .map(assetService::mapToPortfolioResponse)
                        .toList();

        double totalInvested = assetResponses.stream().mapToDouble(AssetResponse::totalInvested).sum();
        double totalCurrentValue = assetResponses.stream().mapToDouble(AssetResponse::currentValue).sum();
        double totalProfit = assetResponses.stream().mapToDouble(AssetResponse::profit).sum();

        return new WalletPortfolioResponse(
                wallet.getId(),
                wallet.getName(),
                totalInvested,
                totalCurrentValue,
                totalProfit,
                assetResponses
        );
    }
}
