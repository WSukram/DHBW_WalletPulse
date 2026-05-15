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

    public List<Transaction> getTransactionsByAssetId(Long assetId, String ownerEmail) {
        Asset asset = requireAsset(assetId);
        requireOwnership(asset, ownerEmail);
        return transactionRepository.findByAssetId(assetId);
    }

    public Transaction getTransactionById(Long transactionId, String ownerEmail) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Transaction with id " + transactionId + " not found"));
        requireOwnership(transaction.getAsset(), ownerEmail);
        return transaction;
    }

    public Transaction createTransaction(Long assetId, double amount, double buyPrice, LocalDate date, String ownerEmail) {
        Asset asset = requireAsset(assetId);
        requireOwnership(asset, ownerEmail);
        Transaction transaction = Transaction.builder()
                .asset(asset)
                .amount(amount)
                .buyPrice(buyPrice)
                .date(date)
                .build();
        return transactionRepository.save(transaction);
    }

    public Transaction updateTransaction(Long transactionId, double amount, double buyPrice, LocalDate date, String ownerEmail) {
        Transaction existing = getTransactionById(transactionId, ownerEmail);
        existing.setAmount(amount);
        existing.setBuyPrice(buyPrice);
        existing.setDate(date);
        return transactionRepository.save(existing);
    }

    public void deleteTransaction(Long transactionId, String ownerEmail) {
        Transaction existing = getTransactionById(transactionId, ownerEmail);
        Asset asset = existing.getAsset();
        transactionRepository.delete(existing);
        if (transactionRepository.countByAssetId(asset.getId()) == 0) {
            assetRepository.delete(asset);
        }
    }

    private Asset requireAsset(Long assetId) {
        return assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset with id " + assetId + " not found"));
    }

    private void requireOwnership(Asset asset, String ownerEmail) {
        if (!asset.getWallet().getOwner().getEmail().equals(ownerEmail)) {
            throw new ResourceNotFoundException("Asset with id " + asset.getId() + " not found");
        }
    }
}
