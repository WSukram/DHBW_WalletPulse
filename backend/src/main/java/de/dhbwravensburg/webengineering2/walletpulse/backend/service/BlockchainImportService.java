package de.dhbwravensburg.webengineering2.walletpulse.backend.service;

import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.ChainType;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Wallet;
import de.dhbwravensburg.webengineering2.walletpulse.backend.exception.BusinessException;
import de.dhbwravensburg.webengineering2.walletpulse.backend.exception.ResourceNotFoundException;
import de.dhbwravensburg.webengineering2.walletpulse.backend.repository.WalletRepository;
import de.dhbwravensburg.webengineering2.walletpulse.backend.service.blockchain.ChainImporter;
import de.dhbwravensburg.webengineering2.walletpulse.backend.service.blockchain.ImportResult;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Orchestrates on-chain transaction imports. The per-chain logic lives in the
 * {@link ChainImporter} implementations under {@code service.blockchain}; this
 * class only resolves the wallet, dispatches to the matching importer and
 * stamps {@code lastImportTime}.
 */
@Service
@Transactional
public class BlockchainImportService {

    private final WalletRepository walletRepository;
    private final Map<ChainType, ChainImporter> importersByChain;

    public BlockchainImportService(WalletRepository walletRepository, List<ChainImporter> importers) {
        this.walletRepository = walletRepository;
        this.importersByChain = importers.stream()
                .collect(Collectors.toMap(ChainImporter::chainType, i -> i));
    }

    public ImportResult importWallet(Long walletId, String ownerEmail) {
        Wallet wallet = walletRepository.findByIdAndOwnerEmail(walletId, ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet with id " + walletId + " not found"));

        if (wallet.getChainType() == null || wallet.getChainAddress() == null) {
            throw new IllegalStateException("Wallet has no chain address configured.");
        }

        ChainImporter importer = importersByChain.get(wallet.getChainType());
        if (importer == null) {
            throw new IllegalStateException("No importer registered for chain " + wallet.getChainType());
        }

        ImportResult result;
        try {
            result = importer.importTransactions(wallet);
        } catch (RuntimeException e) {
            throw new BusinessException("Import failed: " + e.getMessage());
        }

        wallet.setLastImportTime(LocalDateTime.now());
        walletRepository.save(wallet);
        return result;
    }
}
