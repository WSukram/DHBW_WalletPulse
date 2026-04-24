package de.dhbwravensburg.webengineering2.walletpulse.backend.service;

import de.dhbwravensburg.webengineering2.walletpulse.backend.api.CoinGeckoClient;
import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.AssetResponse;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Asset;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Transaction;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Wallet;
import de.dhbwravensburg.webengineering2.walletpulse.backend.exception.ResourceNotFoundException;
import de.dhbwravensburg.webengineering2.walletpulse.backend.repository.AssetRepository;
import de.dhbwravensburg.webengineering2.walletpulse.backend.repository.WalletRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class AssetService {

    private final AssetRepository assetRepository;
    private final WalletRepository walletRepository;
    private final CoinGeckoClient coinGeckoClient;

    public AssetService(AssetRepository assetRepository, WalletRepository walletRepository, CoinGeckoClient coinGeckoClient) {
        this.assetRepository = assetRepository;
        this.walletRepository = walletRepository;
        this.coinGeckoClient = coinGeckoClient;
    }

    public List<Asset> getAssetsByWalletId(Long walletId) {
        return assetRepository.findByWalletId(walletId);
    }

    public Asset getAssetById(Long assetId) {
        return assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset with id " + assetId + " not found"));
    }

    public Asset createAsset(Long walletId, String coinId) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet with id " + walletId + " not found"));

        Asset asset = Asset.builder()
                .coinId(coinId)
                .wallet(wallet)
                .build();

        return assetRepository.save(asset);
    }

    public Asset updateAsset(Long assetId, String coinId) {
        Asset existingAsset = getAssetById(assetId);
        existingAsset.setCoinId(coinId);
        return assetRepository.save(existingAsset);
    }

    public void deleteAsset(Long assetId) {
        Asset existingAsset = getAssetById(assetId);
        assetRepository.delete(existingAsset);
    }

    public AssetResponse mapToPortfolioResponse(Asset asset) {
        double currentPrice = 0.0;
        try {
            currentPrice = coinGeckoClient.getCurrentPriceInEur(asset.getCoinId()).doubleValue();
        } catch (Exception e) {
            // Ignore if price cannot be fetched (e.g., wrong coin ID or rate limit)
            System.err.println("Could not fetch price for " + asset.getCoinId() + ": " + e.getMessage());
        }

        double totalAmount = 0.0;
        double totalInvested = 0.0;

        if (asset.getTransactions() != null) {
            for (Transaction t : asset.getTransactions()) {
                totalAmount += t.getAmount();
                totalInvested += (t.getAmount() * t.getBuyPrice());
            }
        }

        double currentValue = totalAmount * currentPrice;
        double profit = currentValue - totalInvested;

        return new AssetResponse(
                asset.getId(),
                asset.getCoinId(),
                asset.getWallet().getId(),
                totalAmount,
                totalInvested,
                currentPrice,
                currentValue,
                profit
        );
    }
}
