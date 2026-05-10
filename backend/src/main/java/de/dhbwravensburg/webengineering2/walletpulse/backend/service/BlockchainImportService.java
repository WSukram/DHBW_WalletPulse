package de.dhbwravensburg.webengineering2.walletpulse.backend.service;

import de.dhbwravensburg.webengineering2.walletpulse.backend.api.EtherscanClient;
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

    // Maps common ERC-20 token symbols to CoinGecko coin IDs
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

    public BlockchainImportService(
            WalletRepository walletRepository,
            AssetRepository assetRepository,
            TransactionRepository transactionRepository,
            HistoricalPriceService historicalPriceService,
            EtherscanClient etherscanClient) {
        this.walletRepository = walletRepository;
        this.assetRepository = assetRepository;
        this.transactionRepository = transactionRepository;
        this.historicalPriceService = historicalPriceService;
        this.etherscanClient = etherscanClient;
    }

    public ImportResult importWallet(Long walletId, String ownerEmail) {
        Wallet wallet = walletRepository.findByIdAndOwnerEmail(walletId, ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet with id " + walletId + " not found"));

        if (wallet.getChainType() == null || wallet.getChainAddress() == null) {
            throw new IllegalStateException("Wallet has no chain address configured.");
        }
        if (wallet.getChainType() != ChainType.ETH) {
            throw new IllegalStateException("Only ETH import is currently supported.");
        }

        int imported = 0;
        int skipped = 0;
        int failed = 0;

        String address = wallet.getChainAddress().toLowerCase();

        // Import native ETH incoming transfers
        List<Map<String, String>> normalTxs = etherscanClient.getNormalTransactions(address);
        for (Map<String, String> tx : normalTxs) {
            if (!"0".equals(tx.get("isError")) || !address.equals(tx.get("to"))) continue;
            String value = tx.get("value");
            if (value == null || "0".equals(value)) continue;

            try {
                if (saveTx(wallet, tx, "ethereum", new BigDecimal(value), WEI_PER_ETH, 18)) {
                    imported++;
                } else {
                    skipped++;
                }
            } catch (Exception e) {
                failed++;
            }
        }

        // Import ERC-20 incoming transfers
        List<Map<String, String>> erc20Txs = etherscanClient.getErc20Transfers(address);
        for (Map<String, String> tx : erc20Txs) {
            if (!address.equals(tx.get("to"))) continue;
            String value = tx.get("value");
            if (value == null || "0".equals(value)) continue;

            String symbol = tx.get("tokenSymbol");
            String coinId = TOKEN_TO_COINGECKO_ID.getOrDefault(symbol, symbol != null ? symbol.toLowerCase() : "unknown");
            int decimals = parseDecimals(tx.get("tokenDecimal"));

            try {
                if (saveTx(wallet, tx, coinId, new BigDecimal(value), BigDecimal.TEN.pow(decimals), decimals)) {
                    imported++;
                } else {
                    skipped++;
                }
            } catch (Exception e) {
                failed++;
            }
        }

        return new ImportResult(imported, skipped, failed);
    }

    private boolean saveTx(Wallet wallet, Map<String, String> tx, String coinId,
                            BigDecimal rawValue, BigDecimal divisor, int scale) {
        String txHash = tx.get("hash");
        if (transactionRepository.existsByTxHash(txHash)) {
            return false;
        }

        double amount = rawValue.divide(divisor, scale, RoundingMode.HALF_UP).doubleValue();
        LocalDate date = Instant.ofEpochSecond(Long.parseLong(tx.get("timeStamp")))
                .atZone(ZoneOffset.UTC)
                .toLocalDate();

        BigDecimal eurPrice;
        try {
            eurPrice = historicalPriceService.getEurPrice(coinId, date);
        } catch (Exception e) {
            eurPrice = BigDecimal.ZERO;
        }

        Asset asset = assetRepository.findByWalletIdAndCoinId(wallet.getId(), coinId)
                .orElseGet(() -> assetRepository.save(
                        Asset.builder().coinId(coinId).wallet(wallet).build()
                ));

        transactionRepository.save(
                Transaction.builder()
                        .asset(asset)
                        .amount(amount)
                        .buyPrice(eurPrice.doubleValue())
                        .date(date)
                        .txHash(txHash)
                        .source(TransactionSource.IMPORTED)
                        .build()
        );
        return true;
    }

    private int parseDecimals(String tokenDecimal) {
        try {
            return Integer.parseInt(tokenDecimal);
        } catch (Exception e) {
            return 18;
        }
    }

    public record ImportResult(int imported, int skipped, int failed) {}
}
