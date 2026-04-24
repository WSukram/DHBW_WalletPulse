package de.dhbwravensburg.webengineering2.walletpulse.backend.service;

import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Asset;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Wallet;
import de.dhbwravensburg.webengineering2.walletpulse.backend.exception.ResourceNotFoundException;
import de.dhbwravensburg.webengineering2.walletpulse.backend.repository.AssetRepository;
import de.dhbwravensburg.webengineering2.walletpulse.backend.repository.WalletRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AssetService {

    private final AssetRepository assetRepository;
    private final WalletRepository walletRepository;

    public AssetService(AssetRepository assetRepository, WalletRepository walletRepository) {
        this.assetRepository = assetRepository;
        this.walletRepository = walletRepository;
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
}

