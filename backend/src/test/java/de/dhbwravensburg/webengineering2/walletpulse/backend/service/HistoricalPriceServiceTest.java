package de.dhbwravensburg.webengineering2.walletpulse.backend.service;

import de.dhbwravensburg.webengineering2.walletpulse.backend.api.CoinGeckoClient;
import de.dhbwravensburg.webengineering2.walletpulse.backend.api.CryptoCompareClient;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.HistoricalPrice;
import de.dhbwravensburg.webengineering2.walletpulse.backend.repository.HistoricalPriceRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HistoricalPriceServiceTest {

    @Mock private HistoricalPriceRepository repo;
    @Mock private CoinGeckoClient coinGeckoClient;
    @Mock private CryptoCompareClient cryptoCompareClient;

    @InjectMocks
    private HistoricalPriceService service;

    @Test
    void todayUsesLivePrice() {
        LocalDate today = LocalDate.now();
        when(repo.findByCoinIdAndDate("bitcoin", today)).thenReturn(Optional.empty());
        when(coinGeckoClient.getCurrentPriceInEur("bitcoin")).thenReturn(new BigDecimal("60000"));
        when(repo.save(any(HistoricalPrice.class))).thenAnswer(inv -> inv.getArgument(0));

        BigDecimal result = service.getEurPrice("bitcoin", today);

        assertEquals(new BigDecimal("60000"), result);
        verify(coinGeckoClient, times(1)).getCurrentPriceInEur("bitcoin");
        verify(coinGeckoClient, never()).getHistoricalPriceInEur(eq("bitcoin"), any(LocalDate.class));
    }

    @Test
    void yesterdayUsesHistoricalEndpoint() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        when(repo.findByCoinIdAndDate("bitcoin", yesterday)).thenReturn(Optional.empty());
        when(coinGeckoClient.getHistoricalPriceInEur("bitcoin", yesterday)).thenReturn(new BigDecimal("59000"));
        when(repo.save(any(HistoricalPrice.class))).thenAnswer(inv -> inv.getArgument(0));

        BigDecimal result = service.getEurPrice("bitcoin", yesterday);

        assertEquals(new BigDecimal("59000"), result);
        verify(coinGeckoClient, times(1)).getHistoricalPriceInEur("bitcoin", yesterday);
        verify(coinGeckoClient, never()).getCurrentPriceInEur("bitcoin");
    }

    @Test
    void cachedPriceShortCircuitsNetwork() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        HistoricalPrice cached = HistoricalPrice.builder()
                .coinId("bitcoin").date(yesterday).eurPrice(new BigDecimal("58000")).build();
        when(repo.findByCoinIdAndDate("bitcoin", yesterday)).thenReturn(Optional.of(cached));

        BigDecimal result = service.getEurPrice("bitcoin", yesterday);

        assertEquals(new BigDecimal("58000"), result);
        verify(coinGeckoClient, never()).getHistoricalPriceInEur(eq("bitcoin"), any(LocalDate.class));
        verify(coinGeckoClient, never()).getCurrentPriceInEur("bitcoin");
    }
}
