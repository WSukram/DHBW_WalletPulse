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

import java.util.List;

/**
 * CRUD for assets plus the mapping of an {@link Asset} to a portfolio response
 * (live price from CoinGecko, holdings and P&amp;L derived from its transactions).
 * Each method takes {@code ownerEmail} and rejects access to assets owned by
 * other users by throwing {@link ResourceNotFoundException} (404 rather than
 * 403, to avoid leaking the existence of foreign resources).
 */
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

    public List<Asset> getAssetsByWalletId(Long walletId, String ownerEmail) {
        requireWalletOwnership(walletId, ownerEmail);
        return assetRepository.findByWalletId(walletId);
    }

    public Asset getAssetById(Long assetId, String ownerEmail) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset with id " + assetId + " not found"));
        requireOwnership(asset, ownerEmail);
        return asset;
    }

    public Asset createAsset(Long walletId, String coinId, String ownerEmail) {
        Wallet wallet = requireWalletOwnership(walletId, ownerEmail);
        Asset asset = Asset.builder()
                .coinId(coinId)
                .wallet(wallet)
                .build();
        return assetRepository.save(asset);
    }

    public Asset updateAsset(Long assetId, String coinId, String ownerEmail) {
        Asset existing = getAssetById(assetId, ownerEmail);
        existing.setCoinId(coinId);
        return assetRepository.save(existing);
    }

    public void deleteAsset(Long assetId, String ownerEmail) {
        Asset existing = getAssetById(assetId, ownerEmail);
        assetRepository.delete(existing);
    }

    public AssetResponse mapToPortfolioResponse(Asset asset) {
        double currentPrice = 0.0;
        try {
            currentPrice = coinGeckoClient.getCurrentPriceInEur(asset.getCoinId()).doubleValue();
        } catch (Exception e) {
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

    private Wallet requireWalletOwnership(Long walletId, String ownerEmail) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet with id " + walletId + " not found"));
        if (!wallet.getOwner().getEmail().equals(ownerEmail)) {
            throw new ResourceNotFoundException("Wallet with id " + walletId + " not found");
        }
        return wallet;
    }

    private void requireOwnership(Asset asset, String ownerEmail) {
        if (!asset.getWallet().getOwner().getEmail().equals(ownerEmail)) {
            throw new ResourceNotFoundException("Asset with id " + asset.getId() + " not found");
        }
    }
}
