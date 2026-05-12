package de.dhbwravensburg.webengineering2.walletpulse.backend.service;

import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Asset;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Transaction;
import de.dhbwravensburg.webengineering2.walletpulse.backend.exception.ResourceNotFoundException;
import de.dhbwravensburg.webengineering2.walletpulse.backend.repository.AssetRepository;
import de.dhbwravensburg.webengineering2.walletpulse.backend.repository.TransactionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private AssetRepository assetRepository;

    @InjectMocks
    private TransactionService transactionService;

    @Test
    void shouldReturnTransactionsByAssetId() {
        Asset asset = new Asset();
        asset.setId(10L);

        Transaction transaction = new Transaction();
        transaction.setId(100L);
        transaction.setAsset(asset);
        transaction.setAmount(0.5);
        transaction.setBuyPrice(58000);
        transaction.setDate(LocalDate.of(2026, 4, 24));

        when(assetRepository.existsById(10L)).thenReturn(true);
        when(transactionRepository.findByAssetId(10L)).thenReturn(List.of(transaction));

        List<Transaction> result = transactionService.getTransactionsByAssetId(10L);

        assertEquals(1, result.size());
        assertEquals(0.5, result.get(0).getAmount());
        assertEquals(58000, result.get(0).getBuyPrice());
    }

    @Test
    void shouldThrowWhenAssetNotFoundOnList() {
        when(assetRepository.existsById(10L)).thenReturn(false);

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> transactionService.getTransactionsByAssetId(10L)
        );

        assertEquals("Asset with id 10 not found", ex.getMessage());
    }

    @Test
    void shouldCreateTransaction() {
        Asset asset = new Asset();
        asset.setId(10L);

        Transaction saved = new Transaction();
        saved.setId(100L);
        saved.setAsset(asset);
        saved.setAmount(1.2);
        saved.setBuyPrice(2500);
        saved.setDate(LocalDate.of(2026, 1, 10));

        when(assetRepository.findById(10L)).thenReturn(Optional.of(asset));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(saved);

        Transaction result = transactionService.createTransaction(10L, 1.2, 2500, LocalDate.of(2026, 1, 10));

        assertEquals(100L, result.getId());
        assertEquals(10L, result.getAsset().getId());
        assertEquals(1.2, result.getAmount());
        assertEquals(2500, result.getBuyPrice());
    }

    @Test
    void shouldUpdateTransaction() {
        Asset asset = new Asset();
        asset.setId(10L);

        Transaction existing = new Transaction();
        existing.setId(100L);
        existing.setAsset(asset);
        existing.setAmount(0.2);
        existing.setBuyPrice(1800);
        existing.setDate(LocalDate.of(2025, 12, 24));

        when(transactionRepository.findById(100L)).thenReturn(Optional.of(existing));
        when(transactionRepository.save(existing)).thenReturn(existing);

        Transaction result = transactionService.updateTransaction(100L, 0.4, 2000, LocalDate.of(2026, 2, 1));

        assertEquals(0.4, result.getAmount());
        assertEquals(2000, result.getBuyPrice());
        assertEquals(LocalDate.of(2026, 2, 1), result.getDate());
        verify(transactionRepository).save(existing);
    }

    @Test
    void shouldDeleteTransaction() {
        Asset asset = new Asset();
        asset.setId(10L);

        Transaction existing = new Transaction();
        existing.setId(100L);
        existing.setAsset(asset);

        when(transactionRepository.findById(100L)).thenReturn(Optional.of(existing));

        transactionService.deleteTransaction(100L);

        verify(transactionRepository).delete(existing);
    }
}

