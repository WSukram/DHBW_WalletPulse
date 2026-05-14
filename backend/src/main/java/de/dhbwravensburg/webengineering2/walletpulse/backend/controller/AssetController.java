package de.dhbwravensburg.webengineering2.walletpulse.backend.controller;

import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.AssetRequest;
import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.AssetResponse;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Asset;
import de.dhbwravensburg.webengineering2.walletpulse.backend.service.AssetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Tag(name = "Assets", description = "CRUD endpoints for wallet assets")
public class AssetController {

    private final AssetService assetService;

    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    @GetMapping("/api/wallets/{walletId}/assets")
    @Operation(summary = "Get all assets of a wallet")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "Assets loaded successfully")})
    public List<AssetResponse> getAssetsByWalletId(
            @PathVariable Long walletId,
            @AuthenticationPrincipal UserDetails user) {
        return assetService.getAssetsByWalletId(walletId, user.getUsername())
                .stream()
                .map(assetService::mapToPortfolioResponse)
                .toList();
    }

    @GetMapping("/api/assets/{assetId}")
    @Operation(summary = "Get an asset by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Asset found"),
            @ApiResponse(responseCode = "404", description = "Asset not found")
    })
    public AssetResponse getAssetById(
            @PathVariable Long assetId,
            @AuthenticationPrincipal UserDetails user) {
        return assetService.mapToPortfolioResponse(assetService.getAssetById(assetId, user.getUsername()));
    }

    @PostMapping("/api/wallets/{walletId}/assets")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Add a new asset to a wallet")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Asset created"),
            @ApiResponse(responseCode = "400", description = "Invalid request"),
            @ApiResponse(responseCode = "404", description = "Wallet not found")
    })
    public AssetResponse createAsset(
            @Parameter(description = "Wallet ID", example = "1") @PathVariable Long walletId,
            @Valid @RequestBody AssetRequest request,
            @AuthenticationPrincipal UserDetails user) {
        Asset created = assetService.createAsset(walletId, request.coinId(), user.getUsername());
        return assetService.mapToPortfolioResponse(created);
    }

    @PutMapping("/api/assets/{assetId}")
    @Operation(summary = "Update an asset")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Asset updated"),
            @ApiResponse(responseCode = "404", description = "Asset not found")
    })
    public AssetResponse updateAsset(
            @Parameter(description = "Asset ID", example = "10") @PathVariable Long assetId,
            @Valid @RequestBody AssetRequest request,
            @AuthenticationPrincipal UserDetails user) {
        Asset updated = assetService.updateAsset(assetId, request.coinId(), user.getUsername());
        return assetService.mapToPortfolioResponse(updated);
    }

    @DeleteMapping("/api/assets/{assetId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete an asset")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Asset deleted"),
            @ApiResponse(responseCode = "404", description = "Asset not found")
    })
    public void deleteAsset(
            @Parameter(description = "Asset ID", example = "10") @PathVariable Long assetId,
            @AuthenticationPrincipal UserDetails user) {
        assetService.deleteAsset(assetId, user.getUsername());
    }
}
