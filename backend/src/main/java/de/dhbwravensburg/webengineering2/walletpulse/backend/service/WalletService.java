package de.dhbwravensburg.webengineering2.walletpulse.backend.service;

import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.AssetResponse;
import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.WalletPortfolioResponse;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Asset;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Wallet;
import de.dhbwravensburg.webengineering2.walletpulse.backend.exception.ResourceNotFoundException;
import de.dhbwravensburg.webengineering2.walletpulse.backend.repository.WalletRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class WalletService {

    private final WalletRepository walletRepository;
    private final AssetService assetService;

    public WalletService(WalletRepository walletRepository, AssetService assetService) {
        this.walletRepository = walletRepository;
        this.assetService = assetService;
    }

    public List<Wallet> getAllWallets() {
       return walletRepository.findAll();
    }

    public Wallet createWallet(Wallet wallet) {
        return walletRepository.save(wallet);
    }

    public Wallet getWalletById(Long id) {
        return walletRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Wallet with id " + id + " not found"));
    }

    public void deleteWallet(Long id) {
        walletRepository.deleteById(id);
    }

    public Wallet updateWallet(Long id, Wallet updatedWallet){
        Wallet existing = getWalletById(id);
        existing.setName(updatedWallet.getName());
        return walletRepository.save(existing);
    }

    public WalletPortfolioResponse getWalletPortfolio(Long id) {
        Wallet wallet = getWalletById(id);

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

