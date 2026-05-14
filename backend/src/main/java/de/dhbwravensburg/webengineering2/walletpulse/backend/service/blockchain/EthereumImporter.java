package de.dhbwravensburg.webengineering2.walletpulse.backend.service.blockchain;

import de.dhbwravensburg.webengineering2.walletpulse.backend.api.EtherscanClient;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.ChainType;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Wallet;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Map;

@Component
public class EthereumImporter implements ChainImporter {

    private static final BigDecimal WEI_PER_ETH = new BigDecimal("1000000000000000000");

    // ERC-20 symbol → CoinGecko coin id. We hardcode the common tokens because
    // CoinGecko has no public symbol-to-id endpoint; unmapped symbols fall back
    // to lower-casing the symbol, which works for many but not all coins.
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

    private final EtherscanClient etherscanClient;
    private final ImportSupport support;

    public EthereumImporter(EtherscanClient etherscanClient, ImportSupport support) {
        this.etherscanClient = etherscanClient;
        this.support = support;
    }

    @Override
    public ChainType chainType() {
        return ChainType.ETH;
    }

    @Override
    public ImportResult importTransactions(Wallet wallet) {
        int imported = 0, skipped = 0, failed = 0;
        String address = wallet.getChainAddress().toLowerCase();

        for (Map<String, String> tx : etherscanClient.getNormalTransactions(address)) {
            if (!"0".equals(tx.get("isError")) || !address.equals(tx.get("to"))) continue;
            String value = tx.get("value");
            if (value == null || "0".equals(value)) continue;
            try {
                switch (saveTx(wallet, tx.get("hash"), "ethereum", new BigDecimal(value), WEI_PER_ETH, 18, tx.get("timeStamp"))) {
                    case IMPORTED -> imported++;
                    case SKIPPED -> skipped++;
                }
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
                switch (saveTx(wallet, tx.get("hash"), coinId, new BigDecimal(value), BigDecimal.TEN.pow(decimals), decimals, tx.get("timeStamp"))) {
                    case IMPORTED -> imported++;
                    case SKIPPED -> skipped++;
                }
            } catch (Exception e) { failed++; }
        }

        return new ImportResult(imported, skipped, failed);
    }

    private ImportSupport.UpsertOutcome saveTx(Wallet wallet, String hash, String coinId, BigDecimal raw,
                                               BigDecimal divisor, int scale, String timestamp) {
        LocalDate date = Instant.ofEpochSecond(Long.parseLong(timestamp)).atZone(ZoneOffset.UTC).toLocalDate();
        double amount = raw.divide(divisor, scale, RoundingMode.HALF_UP).doubleValue();
        return support.upsertImported(wallet, coinId, hash, amount, date);
    }

    private static int parseDecimals(String tokenDecimal) {
        try { return Integer.parseInt(tokenDecimal); } catch (Exception e) { return 18; }
    }
}
