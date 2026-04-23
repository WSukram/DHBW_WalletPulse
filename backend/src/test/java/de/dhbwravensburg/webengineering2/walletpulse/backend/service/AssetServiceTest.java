package de.dhbwravensburg.webengineering2.walletpulse.backend.service;

import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Asset;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Wallet;
import de.dhbwravensburg.webengineering2.walletpulse.backend.exception.ResourceNotFoundException;
import de.dhbwravensburg.webengineering2.walletpulse.backend.repository.AssetRepository;
import de.dhbwravensburg.webengineering2.walletpulse.backend.repository.WalletRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AssetServiceTest {

    @Mock
    private AssetRepository assetRepository;

    @Mock
    private WalletRepository walletRepository;

    @InjectMocks
    private AssetService assetService;

    @Test
    void shouldReturnAssetsByWalletId() {
        Wallet wallet = new Wallet();
        wallet.setId(1L);

        Asset asset = new Asset();
        asset.setId(11L);
        asset.setCoinId("bitcoin");
        asset.setWallet(wallet);

        when(assetRepository.findByWalletId(1L)).thenReturn(List.of(asset));

        List<Asset> result = assetService.getAssetsByWalletId(1L);

        assertEquals(1, result.size());
        assertEquals("bitcoin", result.get(0).getCoinId());
    }

    @Test
    void shouldCreateAssetForWallet() {
        Wallet wallet = new Wallet();
        wallet.setId(1L);

        Asset saved = new Asset();
        saved.setId(10L);
        saved.setCoinId("ethereum");
        saved.setWallet(wallet);

        when(walletRepository.findById(1L)).thenReturn(Optional.of(wallet));
        when(assetRepository.save(org.mockito.ArgumentMatchers.any(Asset.class))).thenReturn(saved);

        Asset result = assetService.createAsset(1L, "ethereum");

        assertEquals(10L, result.getId());
        assertEquals("ethereum", result.getCoinId());
        assertEquals(1L, result.getWallet().getId());
    }

    @Test
    void shouldThrowWhenWalletNotFoundOnCreate() {
        when(walletRepository.findById(1L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> assetService.createAsset(1L, "bitcoin")
        );

        assertEquals("Wallet with id 1 not found", ex.getMessage());
    }

    @Test
    void shouldUpdateAssetCoinId() {
        Wallet wallet = new Wallet();
        wallet.setId(2L);

        Asset existing = new Asset();
        existing.setId(3L);
        existing.setCoinId("btc");
        existing.setWallet(wallet);

        when(assetRepository.findById(3L)).thenReturn(Optional.of(existing));
        when(assetRepository.save(existing)).thenReturn(existing);

        Asset result = assetService.updateAsset(3L, "bitcoin");

        assertEquals("bitcoin", result.getCoinId());
        verify(assetRepository).save(existing);
    }

    @Test
    void shouldDeleteAsset() {
        Wallet wallet = new Wallet();
        wallet.setId(2L);

        Asset existing = new Asset();
        existing.setId(3L);
        existing.setWallet(wallet);

        when(assetRepository.findById(3L)).thenReturn(Optional.of(existing));

        assetService.deleteAsset(3L);

        verify(assetRepository).delete(existing);
    }
}

