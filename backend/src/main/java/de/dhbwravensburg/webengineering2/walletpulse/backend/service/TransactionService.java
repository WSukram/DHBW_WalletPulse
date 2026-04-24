package de.dhbwravensburg.webengineering2.walletpulse.backend.service;

import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Asset;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Transaction;
import de.dhbwravensburg.webengineering2.walletpulse.backend.exception.ResourceNotFoundException;
import de.dhbwravensburg.webengineering2.walletpulse.backend.repository.AssetRepository;
import de.dhbwravensburg.webengineering2.walletpulse.backend.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AssetRepository assetRepository;

    public TransactionService(TransactionRepository transactionRepository, AssetRepository assetRepository) {
        this.transactionRepository = transactionRepository;
        this.assetRepository = assetRepository;
    }

    public List<Transaction> getTransactionsByAssetId(Long assetId) {
        ensureAssetExists(assetId);
        return transactionRepository.findByAssetId(assetId);
    }

    public Transaction getTransactionById(Long transactionId) {
        return transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Transaction with id " + transactionId + " not found"
                ));
    }

    public Transaction createTransaction(Long assetId, double amount, double buyPrice, LocalDate date) {
        Asset asset = getAssetById(assetId);

        Transaction transaction = Transaction.builder()
                .asset(asset)
                .amount(amount)
                .buyPrice(buyPrice)
                .date(date)
                .build();

        return transactionRepository.save(transaction);
    }

    public Transaction updateTransaction(Long transactionId, double amount, double buyPrice, LocalDate date) {
        Transaction existingTransaction = getTransactionById(transactionId);
        existingTransaction.setAmount(amount);
        existingTransaction.setBuyPrice(buyPrice);
        existingTransaction.setDate(date);
        return transactionRepository.save(existingTransaction);
    }

    public void deleteTransaction(Long transactionId) {
        Transaction existingTransaction = getTransactionById(transactionId);
        transactionRepository.delete(existingTransaction);
    }

    private Asset getAssetById(Long assetId) {
        return assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Asset with id " + assetId + " not found"
                ));
    }

    private void ensureAssetExists(Long assetId) {
        if (!assetRepository.existsById(assetId)) {
            throw new ResourceNotFoundException("Asset with id " + assetId + " not found");
        }
    }
}

