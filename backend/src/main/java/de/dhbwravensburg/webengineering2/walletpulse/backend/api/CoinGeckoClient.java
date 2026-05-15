package de.dhbwravensburg.webengineering2.walletpulse.backend.api;

import de.dhbwravensburg.webengineering2.walletpulse.backend.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CoinGeckoClient {

    public record MarketPrice(java.math.BigDecimal eur, Double eurChange24h) {}

    private final RestTemplate restTemplate;

    @Value("${coingecko.api.url:https://api.coingecko.com/api/v3}")
    private String apiUrl;

    @Value("${coingecko.api.key:}")
    private String apiKey;

    public CoinGeckoClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Returns the current price of the given coin in EUR.
     * Example CoinGecko call: /simple/price?ids=bitcoin&vs_currencies=eur
     * Result is cached in-memory per coin id to keep us within the free-tier rate limit.
     */
    @Cacheable(value = "coinPrices", key = "#coinId")
    public BigDecimal getCurrentPriceInEur(String coinId) {
        String url = String.format("%s/simple/price?ids=%s&vs_currencies=eur", apiUrl, coinId);

        HttpHeaders headers = new HttpHeaders();
        if (apiKey != null && !apiKey.isEmpty()) {
            headers.set("x-cg-demo-api-key", apiKey);
        }
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map<String, Map<String, BigDecimal>>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<>() {}
            );

            Map<String, Map<String, BigDecimal>> body = response.getBody();

            if (body != null && body.containsKey(coinId) && body.get(coinId).containsKey("eur")) {
                return body.get(coinId).get("eur");
            } else {
                throw new ResourceNotFoundException("Price for coin id '" + coinId + "' could not be found.");
            }

        } catch (RestClientException e) {
            throw new RuntimeException("Failed to fetch data from CoinGecko for: " + coinId, e);
        }
    }

    @Cacheable(value = "marketPrices", key = "#coinIds.toString()")
    public Map<String, MarketPrice> getMarketPrices(List<String> coinIds) {
        String ids = String.join(",", coinIds);
        String url = String.format("%s/simple/price?ids=%s&vs_currencies=eur&include_24hr_change=true", apiUrl, ids);

        HttpHeaders headers = new HttpHeaders();
        if (apiKey != null && !apiKey.isEmpty()) {
            headers.set("x-cg-demo-api-key", apiKey);
        }
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map<String, Map<String, Object>>> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, new ParameterizedTypeReference<>() {}
            );
            Map<String, Map<String, Object>> body = response.getBody();
            Map<String, MarketPrice> result = new HashMap<>();
            if (body != null) {
                body.forEach((coinId, data) -> {
                    BigDecimal price = new BigDecimal(data.get("eur").toString());
                    Double change = data.get("eur_24h_change") != null
                            ? ((Number) data.get("eur_24h_change")).doubleValue()
                            : null;
                    result.put(coinId, new MarketPrice(price, change));
                });
            }
            return result;
        } catch (RestClientException e) {
            throw new RuntimeException("Failed to fetch market prices from CoinGecko", e);
        }
    }

    public BigDecimal getHistoricalPriceInEur(String coinId, LocalDate date) {
        String formattedDate = date.format(DateTimeFormatter.ofPattern("dd-MM-yyyy"));
        String url = String.format("%s/coins/%s/history?date=%s&localization=false", apiUrl, coinId, formattedDate);

        HttpHeaders headers = new HttpHeaders();
        if (apiKey != null && !apiKey.isEmpty()) {
            headers.set("x-cg-demo-api-key", apiKey);
        }
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        for (int attempt = 0; attempt < 2; attempt++) {
            try {
                ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                        url, HttpMethod.GET, entity, new ParameterizedTypeReference<>() {}
                );
                Map<String, Object> body = response.getBody();
                if (body != null && body.get("market_data") instanceof Map<?, ?> md) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> currentPrice = (Map<String, Object>) md.get("current_price");
                    if (currentPrice != null && currentPrice.containsKey("eur")) {
                        return new BigDecimal(currentPrice.get("eur").toString());
                    }
                }
                throw new ResourceNotFoundException("Historical price for '" + coinId + "' on " + date + " is not available.");
            } catch (HttpClientErrorException e) {
                if (e.getStatusCode().value() == 429 && attempt == 0) {
                    System.err.println("[CoinGecko] Rate limited (429) — waiting 65s before retry for " + coinId + " on " + date);
                    try { Thread.sleep(65_000); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
                    continue;
                }
                System.err.println("[CoinGecko] HTTP " + e.getStatusCode().value() + " for " + coinId + " on " + date);
                throw new RuntimeException("Failed to fetch historical price from CoinGecko for: " + coinId, e);
            } catch (RestClientException e) {
                System.err.println("[CoinGecko] Request failed for " + coinId + " on " + date + ": " + e.getMessage());
                throw new RuntimeException("Failed to fetch historical price from CoinGecko for: " + coinId, e);
            }
        }
        throw new RuntimeException("CoinGecko rate limit persists after retry for: " + coinId);
    }
}

