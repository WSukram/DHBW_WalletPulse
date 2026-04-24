package de.dhbwravensburg.webengineering2.walletpulse.backend.api;

import de.dhbwravensburg.webengineering2.walletpulse.backend.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CoinGeckoClientTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private CoinGeckoClient coinGeckoClient;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(coinGeckoClient, "apiUrl", "https://api.coingecko.com/api/v3");
    }

    @Test
    void shouldReturnPriceWhenCoinExists() {
        // Arrange
        String coinId = "bitcoin";
        BigDecimal expectedPrice = new BigDecimal("55000.00");
        Map<String, Map<String, BigDecimal>> simulatedResponse = Map.of(
                "bitcoin", Map.of("eur", expectedPrice)
        );

        when(restTemplate.exchange(
                eq("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur"),
                eq(HttpMethod.GET),
                any(),
                any(ParameterizedTypeReference.class)
        )).thenReturn(new ResponseEntity<>(simulatedResponse, HttpStatus.OK));

        // Act
        BigDecimal result = coinGeckoClient.getCurrentPriceInEur(coinId);

        // Assert
        assertEquals(expectedPrice, result);
    }

    @Test
    void shouldThrowExceptionWhenCoinNotFound() {
        // Arrange
        String coinId = "unknown-coin";
        Map<String, Map<String, BigDecimal>> simulatedResponse = Map.of(); // Empty JSON response

        when(restTemplate.exchange(
                eq("https://api.coingecko.com/api/v3/simple/price?ids=unknown-coin&vs_currencies=eur"),
                eq(HttpMethod.GET),
                any(),
                any(ParameterizedTypeReference.class)
        )).thenReturn(new ResponseEntity<>(simulatedResponse, HttpStatus.OK));

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            coinGeckoClient.getCurrentPriceInEur(coinId);
        });
    }
}

