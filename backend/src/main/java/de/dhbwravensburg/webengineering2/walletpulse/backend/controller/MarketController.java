package de.dhbwravensburg.webengineering2.walletpulse.backend.controller;

import de.dhbwravensburg.webengineering2.walletpulse.backend.api.CoinGeckoClient;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/market")
@RequiredArgsConstructor
public class MarketController {

    private final CoinGeckoClient coinGeckoClient;

    private static final List<String> TRACKED_COINS = List.of("bitcoin", "ethereum", "solana");

    @GetMapping("/prices")
    public Map<String, CoinGeckoClient.MarketPrice> getPrices() {
        return coinGeckoClient.getMarketPrices(TRACKED_COINS);
    }
}
