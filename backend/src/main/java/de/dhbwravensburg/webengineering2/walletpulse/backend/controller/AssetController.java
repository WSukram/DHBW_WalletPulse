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
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Tag(name = "Assets", description = "CRUD-Endpunkte für Wallet Assets")
public class AssetController {

    private final AssetService assetService;

    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    @GetMapping("/api/wallets/{walletId}/assets")
    @Operation(summary = "Assets einer Wallet abrufen")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Assets erfolgreich geladen")
    })
    public List<AssetResponse> getAssetsByWalletId(@PathVariable Long walletId) {
        return assetService.getAssetsByWalletId(walletId)
                .stream()
                .map(assetService::mapToPortfolioResponse)
                .toList();
    }

    @GetMapping("/api/assets/{assetId}")
    @Operation(summary = "Ein Asset per ID abrufen")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Asset gefunden"),
            @ApiResponse(responseCode = "404", description = "Asset nicht gefunden")
    })
    public AssetResponse getAssetById(@PathVariable Long assetId) {
        return assetService.mapToPortfolioResponse(assetService.getAssetById(assetId));
    }

    @PostMapping("/api/wallets/{walletId}/assets")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Neues Asset in einer Wallet anlegen")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Asset erstellt"),
            @ApiResponse(responseCode = "400", description = "Ungültige Anfrage"),
            @ApiResponse(responseCode = "404", description = "Wallet nicht gefunden")
    })
    public AssetResponse createAsset(
            @Parameter(description = "ID der Wallet", example = "1") @PathVariable Long walletId,
            @Valid @RequestBody AssetRequest request) {
        Asset created = assetService.createAsset(walletId, request.coinId());
        return assetService.mapToPortfolioResponse(created);
    }

    @PutMapping("/api/assets/{assetId}")
    @Operation(summary = "Asset aktualisieren")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Asset aktualisiert"),
            @ApiResponse(responseCode = "400", description = "Ungültige Anfrage"),
            @ApiResponse(responseCode = "404", description = "Asset nicht gefunden")
    })
    public AssetResponse updateAsset(
            @Parameter(description = "ID des Assets", example = "10") @PathVariable Long assetId,
            @Valid @RequestBody AssetRequest request) {
        Asset updated = assetService.updateAsset(assetId, request.coinId());
        return assetService.mapToPortfolioResponse(updated);
    }

    @DeleteMapping("/api/assets/{assetId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Asset löschen")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Asset gelöscht"),
            @ApiResponse(responseCode = "404", description = "Asset nicht gefunden")
    })
    public void deleteAsset(@Parameter(description = "ID des Assets", example = "10") @PathVariable Long assetId) {
        assetService.deleteAsset(assetId);
    }
}
