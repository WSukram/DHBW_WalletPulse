package de.dhbwravensburg.webengineering2.walletpulse.backend.controller;

import de.dhbwravensburg.webengineering2.walletpulse.backend.api.CoinGeckoClient;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/market")
@RequiredArgsConstructor
@Tag(name = "Market", description = "Public live market price data (no authentication required)")
@SecurityRequirements({})
public class MarketController {

    private final CoinGeckoClient coinGeckoClient;

    private static final List<String> TRACKED_COINS = List.of("bitcoin", "ethereum", "solana");

    @GetMapping("/prices")
    @Operation(
            summary = "Get live prices for BTC, ETH and SOL",
            description = "Returns a map keyed by CoinGecko coin id (`bitcoin`, `ethereum`, `solana`) " +
                    "with current EUR/USD prices and 24h change. Results are cached server-side for 60s."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Live prices returned (cached for 60s)")
    })
    public Map<String, CoinGeckoClient.MarketPrice> getPrices() {
        return coinGeckoClient.getMarketPrices(TRACKED_COINS);
    }
}
