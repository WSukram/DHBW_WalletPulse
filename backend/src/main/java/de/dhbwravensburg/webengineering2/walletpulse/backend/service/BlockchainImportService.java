package de.dhbwravensburg.webengineering2.walletpulse.backend.service;

import de.dhbwravensburg.webengineering2.walletpulse.backend.api.BlockstreamClient;
import de.dhbwravensburg.webengineering2.walletpulse.backend.api.EtherscanClient;
import de.dhbwravensburg.webengineering2.walletpulse.backend.api.HeliusClient;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.*;
import de.dhbwravensburg.webengineering2.walletpulse.backend.exception.ResourceNotFoundException;
import de.dhbwravensburg.webengineering2.walletpulse.backend.repository.AssetRepository;
import de.dhbwravensburg.webengineering2.walletpulse.backend.repository.TransactionRepository;
import de.dhbwravensburg.webengineering2.walletpulse.backend.repository.WalletRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;

@Service
public class BlockchainImportService {

    private static final BigDecimal WEI_PER_ETH = new BigDecimal("1000000000000000000");
    private static final BigDecimal SATOSHI_PER_BTC = new BigDecimal("100000000");

    private static final Map<String, String> TOKEN_TO_COINGECKO_ID = Map.ofEntries(
            Map.entry("USDC", "usd-coin"),
            Map.entry("USDT", "tether"),
            Map.entry("DAI", "dai"),
            Map.entry("WETH", "weth"),
            Map.entry("WBTC", "wrapped-bitcoin"),
            Map.entry("LINK", "chainlink"),
            Map.entry("UNI", "uniswap"),
            Map.entry("AAVE", "aave"),
            Map.entry("MATIC", "matic-network"),
            Map.entry("SHIB", "shiba-inu"),
            Map.entry("PEPE", "pepe")
    );

    private final WalletRepository walletRepository;
    private final AssetRepository assetRepository;
    private final TransactionRepository transactionRepository;
    private final HistoricalPriceService historicalPriceService;
    private final EtherscanClient etherscanClient;
    private final BlockstreamClient blockstreamClient;
    private final HeliusClient heliusClient;

    public BlockchainImportService(
            WalletRepository walletRepository,
            AssetRepository assetRepository,
            TransactionRepository transactionRepository,
            HistoricalPriceService historicalPriceService,
            EtherscanClient etherscanClient,
            BlockstreamClient blockstreamClient,
            HeliusClient heliusClient) {
        this.walletRepository = walletRepository;
        this.assetRepository = assetRepository;
        this.transactionRepository = transactionRepository;
        this.historicalPriceService = historicalPriceService;
        this.etherscanClient = etherscanClient;
        this.blockstreamClient = blockstreamClient;
        this.heliusClient = heliusClient;
    }

    public ImportResult importWallet(Long walletId, String ownerEmail) {
        Wallet wallet = walletRepository.findByIdAndOwnerEmail(walletId, ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet with id " + walletId + " not found"));

        if (wallet.getChainType() == null || wallet.getChainAddress() == null) {
            throw new IllegalStateException("Wallet has no chain address configured.");
        }

        return switch (wallet.getChainType()) {
            case ETH -> importEth(wallet);
            case BTC -> importBtc(wallet);
            case SOL -> importSol(wallet);
        };
    }

    private ImportResult importEth(Wallet wallet) {
        int imported = 0, skipped = 0, failed = 0;
        String address = wallet.getChainAddress().toLowerCase();

        for (Map<String, String> tx : etherscanClient.getNormalTransactions(address)) {
            if (!"0".equals(tx.get("isError")) || !address.equals(tx.get("to"))) continue;
            String value = tx.get("value");
            if (value == null || "0".equals(value)) continue;
            try {
                if (saveEthTx(wallet, tx.get("hash"), "ethereum", new BigDecimal(value), WEI_PER_ETH, 18, tx.get("timeStamp"))) imported++;
                else skipped++;
            } catch (Exception e) { failed++; }
        }

        for (Map<String, String> tx : etherscanClient.getErc20Transfers(address)) {
            if (!address.equals(tx.get("to"))) continue;
            String value = tx.get("value");
            if (value == null || "0".equals(value)) continue;
            String symbol = tx.get("tokenSymbol");
            String coinId = TOKEN_TO_COINGECKO_ID.getOrDefault(symbol, symbol != null ? symbol.toLowerCase() : "unknown");
            int decimals = parseDecimals(tx.get("tokenDecimal"));
            try {
                if (saveEthTx(wallet, tx.get("hash"), coinId, new BigDecimal(value), BigDecimal.TEN.pow(decimals), decimals, tx.get("timeStamp"))) imported++;
                else skipped++;
            } catch (Exception e) { failed++; }
        }

        return new ImportResult(imported, skipped, failed);
    }

    private ImportResult importBtc(Wallet wallet) {
        int imported = 0, skipped = 0, failed = 0;
        String address = wallet.getChainAddress();

        List<Map<String, Object>> txs = blockstreamClient.getTransactions(address);
        for (Map<String, Object> tx : txs) {
            String txid = (String) tx.get("txid");
            if (transactionRepository.existsByTxHash(txid)) { skipped++; continue; }

            try {
                long receivedSatoshi = getReceivedSatoshi(tx, address);
                if (receivedSatoshi <= 0) continue;

                long blockTime = toLong(tx.get("status") instanceof Map<?,?> s ? ((Map<?,?>) s).get("block_time") : null);
                if (blockTime == 0) continue;

                LocalDate date = Instant.ofEpochSecond(blockTime).atZone(ZoneOffset.UTC).toLocalDate();
                double amount = new BigDecimal(receivedSatoshi)
                        .divide(SATOSHI_PER_BTC, 8, RoundingMode.HALF_UP).doubleValue();

                BigDecimal eurPrice = getPriceOrZero("bitcoin", date);
                Asset asset = findOrCreateAsset(wallet, "bitcoin");

                transactionRepository.save(Transaction.builder()
                        .asset(asset).amount(amount).buyPrice(eurPrice.doubleValue())
                        .date(date).txHash(txid).source(TransactionSource.IMPORTED).build());
                imported++;
            } catch (Exception e) { failed++; }
        }

        return new ImportResult(imported, skipped, failed);
    }

    private ImportResult importSol(Wallet wallet) {
        int imported = 0, skipped = 0, failed = 0;
        String address = wallet.getChainAddress();

        List<Map<String, Object>> txs = heliusClient.getTransactions(address);
        for (Map<String, Object> tx : txs) {
            String signature = (String) tx.get("signature");
            if (transactionRepository.existsByTxHash(signature)) { skipped++; continue; }

            try {
                Object nativeTransfers = tx.get("nativeTransfers");
                if (!(nativeTransfers instanceof List<?> transfers)) continue;

                long receivedLamports = 0;
                for (Object t : transfers) {
                    if (!(t instanceof Map<?,?> transfer)) continue;
                    if (address.equals(transfer.get("toUserAccount"))) {
                        receivedLamports += toLong(transfer.get("amount"));
                    }
                }
                if (receivedLamports <= 0) continue;

                long timestamp = toLong(tx.get("timestamp"));
                if (timestamp == 0) continue;

                LocalDate date = Instant.ofEpochSecond(timestamp).atZone(ZoneOffset.UTC).toLocalDate();
                double amount = receivedLamports / 1_000_000_000.0;

                BigDecimal eurPrice = getPriceOrZero("solana", date);
                Asset asset = findOrCreateAsset(wallet, "solana");

                transactionRepository.save(Transaction.builder()
                        .asset(asset).amount(amount).buyPrice(eurPrice.doubleValue())
                        .date(date).txHash(signature).source(TransactionSource.IMPORTED).build());
                imported++;
            } catch (Exception e) { failed++; }
        }

        return new ImportResult(imported, skipped, failed);
    }

    private boolean saveEthTx(Wallet wallet, String hash, String coinId, BigDecimal raw,
                               BigDecimal divisor, int scale, String timestamp) {
        if (transactionRepository.existsByTxHash(hash)) return false;
        double amount = raw.divide(divisor, scale, RoundingMode.HALF_UP).doubleValue();
        LocalDate date = Instant.ofEpochSecond(Long.parseLong(timestamp)).atZone(ZoneOffset.UTC).toLocalDate();
        BigDecimal eurPrice = getPriceOrZero(coinId, date);
        Asset asset = findOrCreateAsset(wallet, coinId);
        transactionRepository.save(Transaction.builder()
                .asset(asset).amount(amount).buyPrice(eurPrice.doubleValue())
                .date(date).txHash(hash).source(TransactionSource.IMPORTED).build());
        return true;
    }

    private Asset findOrCreateAsset(Wallet wallet, String coinId) {
        return assetRepository.findByWalletIdAndCoinId(wallet.getId(), coinId)
                .orElseGet(() -> assetRepository.save(Asset.builder().coinId(coinId).wallet(wallet).build()));
    }

    private BigDecimal getPriceOrZero(String coinId, LocalDate date) {
        try {
            return historicalPriceService.getEurPrice(coinId, date);
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    private long getReceivedSatoshi(Map<String, Object> tx, String address) {
        long total = 0;
        Object vout = tx.get("vout");
        if (!(vout instanceof List<?> outputs)) return 0;
        for (Object o : outputs) {
            if (!(o instanceof Map<?,?> output)) continue;
            Object scriptpubkey_address = output.get("scriptpubkey_address");
            if (address.equals(scriptpubkey_address)) {
                total += toLong(output.get("value"));
            }
        }
        return total;
    }

    private long toLong(Object value) {
        if (value instanceof Number n) return n.longValue();
        if (value instanceof String s) { try { return Long.parseLong(s); } catch (Exception e) { return 0; } }
        return 0;
    }

    private int parseDecimals(String tokenDecimal) {
        try { return Integer.parseInt(tokenDecimal); } catch (Exception e) { return 18; }
    }

    public record ImportResult(int imported, int skipped, int failed) {}
}
