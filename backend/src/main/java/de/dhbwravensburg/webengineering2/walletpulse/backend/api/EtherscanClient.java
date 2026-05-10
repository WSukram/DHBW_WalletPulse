package de.dhbwravensburg.webengineering2.walletpulse.backend.api;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class EtherscanClient {

    private final RestTemplate restTemplate;

    @Value("${etherscan.api.key:}")
    private String apiKey;

    @Value("${etherscan.api.url:https://api.etherscan.io/api}")
    private String apiUrl;

    public EtherscanClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public List<Map<String, String>> getNormalTransactions(String address) {
        String url = String.format(
                "%s?module=account&action=txlist&address=%s&startblock=0&endblock=99999999&sort=asc&apikey=%s",
                apiUrl, address, apiKey
        );
        return fetchResults(url);
    }

    public List<Map<String, String>> getErc20Transfers(String address) {
        String url = String.format(
                "%s?module=account&action=tokentx&address=%s&startblock=0&endblock=99999999&sort=asc&apikey=%s",
                apiUrl, address, apiKey
        );
        return fetchResults(url);
    }

    private List<Map<String, String>> fetchResults(String url) {
        Map<String, Object> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<Map<String, Object>>() {}
        ).getBody();

        if (response == null || !"1".equals(response.get("status"))) {
            return List.of();
        }

        @SuppressWarnings("unchecked")
        List<Map<String, String>> result = (List<Map<String, String>>) response.get("result");
        return result != null ? result : List.of();
    }
}
