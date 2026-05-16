package de.dhbwravensburg.webengineering2.walletpulse.backend.api;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class EtherscanClient {

    private final RestTemplate restTemplate;

    @Value("${etherscan.api.key:}")
    private String apiKey;

    @Value("${etherscan.api.url:https://api.etherscan.io/v2/api}")
    private String apiUrl;

    public EtherscanClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public List<Map<String, String>> getNormalTransactions(String address) {
        String url = String.format(
                "%s?chainid=1&module=account&action=txlist&address=%s&startblock=0&endblock=99999999&sort=asc&apikey=%s",
                apiUrl, address, apiKey
        );
        return fetchResults(url);
    }

    public List<Map<String, String>> getErc20Transfers(String address) {
        String url = String.format(
                "%s?chainid=1&module=account&action=tokentx&address=%s&startblock=0&endblock=99999999&sort=asc&apikey=%s",
                apiUrl, address, apiKey
        );
        return fetchResults(url);
    }

    private List<Map<String, String>> fetchResults(String url) {
        Map<String, Object> response;
        try {
            response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            ).getBody();
        } catch (RestClientException e) {
            // RestTemplate echoes the URL in exception messages; scrub the API key before rethrowing.
            String msg = e.getMessage() != null ? e.getMessage().replaceAll("apikey=[^&\\s]+", "apikey=***") : "unknown error";
            throw new RuntimeException("Etherscan request failed: " + msg);
        }

        if (response == null) return List.of();

        String status = String.valueOf(response.get("status"));
        String message = String.valueOf(response.get("message"));

        if (!"1".equals(status)) {
            if ("No transactions found".equalsIgnoreCase(message)) return List.of();
            throw new RuntimeException("Etherscan error: " + message);
        }

        @SuppressWarnings("unchecked")
        List<Map<String, String>> result = (List<Map<String, String>>) response.get("result");
        return result != null ? result : List.of();
    }
}
