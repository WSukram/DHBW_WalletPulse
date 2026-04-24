package de.dhbwravensburg.webengineering2.walletpulse.backend.api;

import de.dhbwravensburg.webengineering2.walletpulse.backend.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Map;

@Service
public class CoinGeckoClient {

    private final RestTemplate restTemplate;

    @Value("${coingecko.api.url:https://api.coingecko.com/api/v3}")
    private String apiUrl;

    @Value("${coingecko.api.key:}")
    private String apiKey;

    public CoinGeckoClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Ruft den aktuellen Preis eines Coins in Euro (EUR) ab.
     * Beispiel-Aufruf an CoinGecko: /simple/price?ids=bitcoin&vs_currencies=eur
     */
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
                throw new ResourceNotFoundException("Preis für Coin ID '" + coinId + "' konnte nicht gefunden werden.");
            }

        } catch (RestClientException e) {
            throw new RuntimeException("Fehler beim Abrufen der Daten von CoinGecko für: " + coinId, e);
        }
    }
}

