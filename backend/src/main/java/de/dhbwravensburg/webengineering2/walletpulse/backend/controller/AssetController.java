package de.dhbwravensburg.webengineering2.walletpulse.backend.controller;

import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.AssetRequest;
import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.AssetResponse;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Asset;
import de.dhbwravensburg.webengineering2.walletpulse.backend.service.AssetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class AssetController {

    private final AssetService assetService;

    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    @GetMapping("/api/wallets/{walletId}/assets")
    public List<AssetResponse> getAssetsByWalletId(@PathVariable Long walletId) {
        return assetService.getAssetsByWalletId(walletId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/api/assets/{assetId}")
    public AssetResponse getAssetById(@PathVariable Long assetId) {
        return toResponse(assetService.getAssetById(assetId));
    }

    @PostMapping("/api/wallets/{walletId}/assets")
    @ResponseStatus(HttpStatus.CREATED)
    public AssetResponse createAsset(@PathVariable Long walletId,
                                     @Valid @RequestBody AssetRequest request) {
        Asset created = assetService.createAsset(walletId, request.coinId());
        return toResponse(created);
    }

    @PutMapping("/api/assets/{assetId}")
    public AssetResponse updateAsset(@PathVariable Long assetId,
                                     @Valid @RequestBody AssetRequest request) {
        Asset updated = assetService.updateAsset(assetId, request.coinId());
        return toResponse(updated);
    }

    @DeleteMapping("/api/assets/{assetId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAsset(@PathVariable Long assetId) {
        assetService.deleteAsset(assetId);
    }

    private AssetResponse toResponse(Asset asset) {
        return new AssetResponse(
                asset.getId(),
                asset.getCoinId(),
                asset.getWallet().getId()
        );
    }
}

