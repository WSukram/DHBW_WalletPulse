package de.dhbwravensburg.webengineering2.walletpulse.backend.api;

import de.dhbwravensburg.webengineering2.walletpulse.backend.exception.ResourceNotFoundException;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;

@Service
public class CryptoCompareClient {

    private static final String API_URL = "https://min-api.cryptocompare.com/data/v2/histoday";

    private final RestTemplate restTemplate;

    public CryptoCompareClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public BigDecimal getDailyCloseInEur(String symbol, LocalDate date) {
        long toTs = date.plusDays(1).atStartOfDay(ZoneOffset.UTC).toEpochSecond();
        String url = String.format("%s?fsym=%s&tsym=EUR&limit=1&toTs=%d", API_URL, symbol.toUpperCase(), toTs);

        try {
            Map<String, Object> response = restTemplate.exchange(
                    url, HttpMethod.GET, null,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            ).getBody();

            if (response != null && "Success".equals(response.get("Response"))) {
                @SuppressWarnings("unchecked")
                Map<String, Object> dataWrapper = (Map<String, Object>) response.get("Data");
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> entries = (List<Map<String, Object>>) dataWrapper.get("Data");
                if (entries != null && !entries.isEmpty()) {
                    Object close = entries.get(entries.size() - 1).get("close");
                    if (close instanceof Number n && n.doubleValue() > 0) {
                        return new BigDecimal(close.toString());
                    }
                }
            }
        } catch (Exception ignored) {}

        throw new ResourceNotFoundException("No CryptoCompare price for " + symbol + " on " + date);
    }
}
