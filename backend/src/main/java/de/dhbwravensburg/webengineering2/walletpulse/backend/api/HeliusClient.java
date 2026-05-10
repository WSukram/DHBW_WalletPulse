package de.dhbwravensburg.webengineering2.walletpulse.backend.api;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class HeliusClient {

    private final RestTemplate restTemplate;

    @Value("${helius.api.key:}")
    private String apiKey;

    @Value("${helius.api.url:https://api.helius.xyz/v0}")
    private String apiUrl;

    public HeliusClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public List<Map<String, Object>> getTransactions(String address) {
        List<Map<String, Object>> all = new ArrayList<>();
        String before = null;

        while (true) {
            String url = apiUrl + "/addresses/" + address + "/transactions?api-key=" + apiKey + "&limit=100";
            if (before != null) {
                url += "&before=" + before;
            }

            List<Map<String, Object>> page = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            ).getBody();

            if (page == null || page.isEmpty()) break;
            all.addAll(page);

            if (page.size() < 100) break;
            before = (String) page.get(page.size() - 1).get("signature");
        }

        return all;
    }
}
