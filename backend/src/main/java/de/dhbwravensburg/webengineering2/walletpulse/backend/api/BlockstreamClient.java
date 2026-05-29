package de.dhbwravensburg.webengineering2.walletpulse.backend.api;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class BlockstreamClient {

    private static final Logger log = LoggerFactory.getLogger(BlockstreamClient.class);
    private static final int MAX_PAGES = 200;

    private final RestTemplate restTemplate;

    @Value("${blockstream.api.url:https://blockstream.info/api}")
    private String apiUrl;

    public BlockstreamClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public List<Map<String, Object>> getTransactions(String address) {
        List<Map<String, Object>> all = new ArrayList<>();
        String lastSeenTxid = null;
        int pageCount = 0;

        while (true) {
            if (pageCount >= MAX_PAGES) {
                log.warn("Blockstream pagination cap ({} pages) reached for address {}", MAX_PAGES, address);
                break;
            }
            pageCount++;
            String url = apiUrl + "/address/" + address + "/txs";
            if (lastSeenTxid != null) {
                url += "/chain/" + lastSeenTxid;
            }

            List<Map<String, Object>> page;
            try {
                page = restTemplate.exchange(
                        url,
                        HttpMethod.GET,
                        null,
                        new ParameterizedTypeReference<List<Map<String, Object>>>() {}
                ).getBody();
            } catch (RestClientException e) {
                log.warn("Blockstream request failed: {}", e.getMessage());
                break;
            }

            if (page == null || page.isEmpty()) break;
            all.addAll(page);

            if (page.size() < 25) break;
            lastSeenTxid = (String) page.get(page.size() - 1).get("txid");
        }

        return all;
    }
}
