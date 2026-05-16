package de.dhbwravensburg.webengineering2.walletpulse.backend.service.blockchain;

import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Asset;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Transaction;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.TransactionSource;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Wallet;
import de.dhbwravensburg.webengineering2.walletpulse.backend.repository.AssetRepository;
import de.dhbwravensburg.webengineering2.walletpulse.backend.repository.TransactionRepository;
import de.dhbwravensburg.webengineering2.walletpulse.backend.service.HistoricalPriceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Shared helpers used by every {@link ChainImporter}: historical price lookup,
 * find-or-create asset, and the idempotent transaction upsert pattern that
 * deduplicates by tx hash and backfills missing prices on re-import.
 */
@Component
public class ImportSupport {

    private static final Logger log = LoggerFactory.getLogger(ImportSupport.class);

    public enum UpsertOutcome { IMPORTED, SKIPPED }

    private final AssetRepository assetRepository;
    private final TransactionRepository transactionRepository;
    private final HistoricalPriceService historicalPriceService;

    public ImportSupport(AssetRepository assetRepository,
                         TransactionRepository transactionRepository,
                         HistoricalPriceService historicalPriceService) {
        this.assetRepository = assetRepository;
        this.transactionRepository = transactionRepository;
        this.historicalPriceService = historicalPriceService;
    }

    /**
     * Returns the EUR price for the given coin/date, or {@code 0} on failure
     * (e.g. rate-limit, missing coin). Returning zero rather than aborting lets
     * the rest of the import proceed; the transaction can be backfilled on a
     * later import once the price source is reachable again.
     */
    public BigDecimal getPriceOrZero(String coinId, LocalDate date) {
        try {
            return historicalPriceService.getEurPrice(coinId, date);
        } catch (Exception e) {
            log.warn("Price lookup failed for {} on {}: {} - {}", coinId, date, e.getClass().getSimpleName(), e.getMessage());
            return BigDecimal.ZERO;
        }
    }

    public Asset findOrCreateAsset(Wallet wallet, String coinId) {
        return assetRepository.findByWalletIdAndCoinId(wallet.getId(), coinId)
                .orElseGet(() -> {
                    try {
                        return assetRepository.save(Asset.builder().coinId(coinId).wallet(wallet).build());
                    } catch (DataIntegrityViolationException race) {
                        // Concurrent import created the same (wallet, coin) row first — re-query and use it.
                        return assetRepository.findByWalletIdAndCoinId(wallet.getId(), coinId)
                                .orElseThrow(() -> race);
                    }
                });
    }

    /**
     * Idempotent transaction insert. If a tx with this hash exists already and
     * has no price recorded, backfill the price (counts as IMPORTED). If it
     * exists and is already priced, return SKIPPED. Otherwise insert a new
     * transaction.
     */
    public UpsertOutcome upsertImported(Wallet wallet, String coinId, String txHash,
                                        double amount, LocalDate date) {
        BigDecimal eurPrice = getPriceOrZero(coinId, date);

        var existing = transactionRepository.findByTxHash(txHash);
        if (existing.isPresent()) {
            Transaction tx = existing.get();
            if (tx.getBuyPrice() == 0.0 && eurPrice.compareTo(BigDecimal.ZERO) > 0) {
                tx.setBuyPrice(eurPrice.doubleValue());
                transactionRepository.save(tx);
                return UpsertOutcome.IMPORTED;
            }
            return UpsertOutcome.SKIPPED;
        }

        Asset asset = findOrCreateAsset(wallet, coinId);
        transactionRepository.save(Transaction.builder()
                .asset(asset).amount(amount).buyPrice(eurPrice.doubleValue())
                .date(date).txHash(txHash).source(TransactionSource.IMPORTED).build());
        return UpsertOutcome.IMPORTED;
    }

    public static long toLong(Object value) {
        if (value instanceof Number n) return n.longValue();
        if (value instanceof String s) { try { return Long.parseLong(s); } catch (Exception e) { return 0; } }
        return 0;
    }
}
