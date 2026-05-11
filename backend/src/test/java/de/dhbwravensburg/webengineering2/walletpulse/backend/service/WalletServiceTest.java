package de.dhbwravensburg.webengineering2.walletpulse.backend.service;

import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.AssetResponse;
import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.WalletPortfolioResponse;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Asset;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.User;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Wallet;
import de.dhbwravensburg.webengineering2.walletpulse.backend.exception.ResourceNotFoundException;
import de.dhbwravensburg.webengineering2.walletpulse.backend.repository.UserRepository;
import de.dhbwravensburg.webengineering2.walletpulse.backend.repository.WalletRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WalletServiceTest {

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AssetService assetService;

    @InjectMocks
    private WalletService walletService;

    @Test
    void shouldReturnAllWallets() {
        Wallet wallet = new Wallet();
        wallet.setName("Main Wallet");

        when(walletRepository.findAllByOwnerEmail("test@test.com"))
                .thenReturn(List.of(wallet));

        List<Wallet> result = walletService.getAllWallets("test@test.com");

        assertEquals(1, result.size());
        assertEquals("Main Wallet", result.get(0).getName());
    }

    @Test
    void shouldReturnWalletById() {
        Wallet wallet = new Wallet();
        wallet.setId(1L);
        wallet.setName("Main Wallet");

        when(walletRepository.findByIdAndOwnerEmail(1L, "test@test.com"))
                .thenReturn(Optional.of(wallet));

        Wallet result = walletService.getWalletById(1L, "test@test.com");

        assertEquals("Main Wallet", result.getName());
    }

    @Test
    void shouldThrowExceptionWhenWalletNotFound() {
        when(walletRepository.findByIdAndOwnerEmail(1L, "test@test.com"))
                .thenReturn(Optional.empty());

        ResourceNotFoundException ex =
                assertThrows(ResourceNotFoundException.class,
                        () -> walletService.getWalletById(1L, "test@test.com"));

        assertEquals("Wallet with id 1 not found", ex.getMessage());
    }

    @Test
    void shouldCreateWallet() {
        User owner = new User();
        owner.setEmail("test@test.com");

        Wallet wallet = new Wallet();
        wallet.setName("New Wallet");

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(owner));
        when(walletRepository.save(wallet)).thenReturn(wallet);

        Wallet result = walletService.createWallet(wallet, "test@test.com");

        verify(walletRepository).save(wallet);
        assertEquals("New Wallet", result.getName());
    }

    @Test
    void shouldUpdateWallet() {
        Wallet existingWallet = new Wallet();
        existingWallet.setId(1L);
        existingWallet.setName("Old Wallet");

        Wallet updatedWallet = new Wallet();
        updatedWallet.setName("Updated Wallet");

        when(walletRepository.findByIdAndOwnerEmail(1L, "test@test.com"))
                .thenReturn(Optional.of(existingWallet));
        when(walletRepository.save(existingWallet)).thenReturn(existingWallet);

        Wallet result = walletService.updateWallet(1L, updatedWallet, "test@test.com");

        assertEquals("Updated Wallet", result.getName());
    }

    @Test
    void shouldReturnWalletPortfolio() {
        Wallet wallet = new Wallet();
        wallet.setId(1L);
        wallet.setName("My Portfolio");

        Asset a1 = new Asset();
        a1.setId(10L);
        wallet.setAssets(List.of(a1));

        AssetResponse ar1 = new AssetResponse(10L, "bitcoin", 1L, 1.0, 50000.0, 60000.0, 60000.0, 10000.0);

        when(walletRepository.findByIdAndOwnerEmail(1L, "test@test.com")).thenReturn(Optional.of(wallet));
        when(assetService.mapToPortfolioResponse(a1)).thenReturn(ar1);

        WalletPortfolioResponse result = walletService.getWalletPortfolio(1L, "test@test.com");

        assertEquals(1L, result.id());
        assertEquals("My Portfolio", result.name());
        assertEquals(50000.0, result.totalInvested());
        assertEquals(60000.0, result.totalCurrentValue());
        assertEquals(10000.0, result.totalProfit());
        assertEquals(1, result.assets().size());
    }
}
