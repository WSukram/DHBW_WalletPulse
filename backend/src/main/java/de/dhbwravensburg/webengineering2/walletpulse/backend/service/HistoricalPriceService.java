package de.dhbwravensburg.webengineering2.walletpulse.backend.service;

import de.dhbwravensburg.webengineering2.walletpulse.backend.api.CoinGeckoClient;
import de.dhbwravensburg.webengineering2.walletpulse.backend.api.CryptoCompareClient;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.HistoricalPrice;
import de.dhbwravensburg.webengineering2.walletpulse.backend.repository.HistoricalPriceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

/**
 * Resolves the EUR price of a coin on a given date through a three-tier lookup:
 * <ol>
 *   <li>local cache table ({@link HistoricalPrice})</li>
 *   <li>CoinGecko historical endpoint (free tier supports only the last 365 days)</li>
 *   <li>CryptoCompare daily-close as fallback for older dates or CoinGecko failures</li>
 * </ol>
 * Resolved prices are persisted to the cache, so each (coinId, date) pair hits
 * the network at most once.
 */
@Service
@Transactional
public class HistoricalPriceService {

    private static final Map<String, String> COINGECKO_TO_CC_SYMBOL = Map.ofEntries(
            Map.entry("bitcoin", "BTC"),
            Map.entry("ethereum", "ETH"),
            Map.entry("solana", "SOL"),
            Map.entry("wrapped-bitcoin", "WBTC"),
            Map.entry("usd-coin", "USDC"),
            Map.entry("tether", "USDT"),
            Map.entry("dai", "DAI"),
            Map.entry("weth", "WETH"),
            Map.entry("chainlink", "LINK"),
            Map.entry("uniswap", "UNI"),
            Map.entry("aave", "AAVE"),
            Map.entry("matic-network", "MATIC"),
            Map.entry("shiba-inu", "SHIB"),
            Map.entry("pepe", "PEPE"),
            Map.entry("msol", "MSOL"),
            Map.entry("lido-staked-sol", "STSOL"),
            Map.entry("bonk", "BONK"),
            Map.entry("jupiter-exchange-solana", "JUP"),
            Map.entry("raydium", "RAY"),
            Map.entry("orca", "ORCA"),
            Map.entry("dogwifcoin", "WIF"),
            Map.entry("pluton", "PLU")
    );

    private final HistoricalPriceRepository historicalPriceRepository;
    private final CoinGeckoClient coinGeckoClient;
    private final CryptoCompareClient cryptoCompareClient;

    public HistoricalPriceService(HistoricalPriceRepository historicalPriceRepository,
                                   CoinGeckoClient coinGeckoClient,
                                   CryptoCompareClient cryptoCompareClient) {
        this.historicalPriceRepository = historicalPriceRepository;
        this.coinGeckoClient = coinGeckoClient;
        this.cryptoCompareClient = cryptoCompareClient;
    }

    public BigDecimal getEurPrice(String coinId, LocalDate date) {
        return historicalPriceRepository.findByCoinIdAndDate(coinId, date)
                .filter(p -> p.getEurPrice().compareTo(BigDecimal.ZERO) > 0)
                .map(HistoricalPrice::getEurPrice)
                .orElseGet(() -> fetchAndCache(coinId, date));
    }

    private BigDecimal fetchAndCache(String coinId, LocalDate date) {
        BigDecimal price = fetchPrice(coinId, date);
        historicalPriceRepository.save(
                HistoricalPrice.builder()
                        .coinId(coinId)
                        .date(date)
                        .eurPrice(price)
                        .build()
        );
        return price;
    }

    private BigDecimal fetchPrice(String coinId, LocalDate date) {
        LocalDate today = LocalDate.now();

        // Only same-day uses the live ticker; yesterday has a finalised close on the historical endpoint.
        if (!date.isBefore(today)) {
            return coinGeckoClient.getCurrentPriceInEur(coinId);
        }

        // CoinGecko's free tier serves historical data only up to one year back.
        boolean coinGeckoSupported = date.isAfter(today.minusDays(365));
        if (coinGeckoSupported) {
            try {
                return coinGeckoClient.getHistoricalPriceInEur(coinId, date);
            } catch (Exception e) {
                System.err.println("[HistoricalPrice] CoinGecko failed for " + coinId + " on " + date + ", trying CryptoCompare: " + e.getMessage());
            }
        }

        String symbol = COINGECKO_TO_CC_SYMBOL.get(coinId);
        if (symbol == null) throw new RuntimeException("No price source available for unknown coin: " + coinId);
        return cryptoCompareClient.getDailyCloseInEur(symbol, date);
    }
}
