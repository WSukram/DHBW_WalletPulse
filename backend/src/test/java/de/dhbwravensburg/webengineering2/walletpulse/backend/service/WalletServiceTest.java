package de.dhbwravensburg.webengineering2.walletpulse.backend.service;

import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Wallet;
import de.dhbwravensburg.webengineering2.walletpulse.backend.exception.ResourceNotFoundException;
import de.dhbwravensburg.webengineering2.walletpulse.backend.repository.WalletRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class WalletServiceTest {

    @Mock
    private WalletRepository walletRepository;

    @InjectMocks
    private WalletService walletService;

    @Test
    void shouldReturnAllWallets() {

        Wallet wallet = new Wallet();
        wallet.setName("Main Wallet");

        when(walletRepository.findAll())
                .thenReturn(List.of(wallet));

        List<Wallet> result = walletService.getAllWallets();

        assertEquals(1, result.size());
        assertEquals("Main Wallet", result.get(0).getName());
    }

    @Test
    void shouldReturnWalletById() {
        Wallet wallet = new Wallet();
        wallet.setId(1L);
        wallet.setName("Main Wallet");

        when(walletRepository.findById(1L))
                .thenReturn(java.util.Optional.of(wallet));

        Wallet result = walletService.getWalletById(1L);

        assertEquals("Main Wallet", result.getName());
    }

    @Test
    void shouldThrowExceptionWhenWalletNotFound() {
        when(walletRepository.findById(1L))
                .thenReturn(java.util.Optional.empty());

        ResourceNotFoundException ex =
                assertThrows(ResourceNotFoundException.class,
                        () -> walletService.getWalletById(1L));

        assertEquals(
                "Wallet with id 1 not found",
                ex.getMessage()
        );

    }

    @Test
    void shouldCreateWallet(){
        Wallet wallet = new Wallet();
        wallet.setName("New Wallet");

        when(walletRepository.save(wallet))
                .thenReturn(wallet);

        verify(walletRepository).save(wallet);

        Wallet result = walletService.createWallet(wallet);

        assertEquals("New Wallet", result.getName());
    }

    @Test
    void shouldUpdateWallet() {
        Wallet existingWallet = new Wallet();
        existingWallet.setId(1L);
        existingWallet.setName("Old Wallet");

        Wallet updatedWallet = new Wallet();
        updatedWallet.setName("Updated Wallet");

        when(walletRepository.findById(1L))
                .thenReturn(java.util.Optional.of(existingWallet));
        when(walletRepository.save(existingWallet))
                .thenReturn(existingWallet);

        Wallet result = walletService.updateWallet(1L, updatedWallet);

        assertEquals("Updated Wallet", result.getName());
    }



}
