package de.dhbwravensburg.webengineering2.walletpulse.backend.service;

import de.dhbwravensburg.webengineering2.walletpulse.backend.api.CoinGeckoClient;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.HistoricalPrice;
import de.dhbwravensburg.webengineering2.walletpulse.backend.repository.HistoricalPriceRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class HistoricalPriceService {

    private final HistoricalPriceRepository historicalPriceRepository;
    private final CoinGeckoClient coinGeckoClient;

    public HistoricalPriceService(HistoricalPriceRepository historicalPriceRepository, CoinGeckoClient coinGeckoClient) {
        this.historicalPriceRepository = historicalPriceRepository;
        this.coinGeckoClient = coinGeckoClient;
    }

    public BigDecimal getEurPrice(String coinId, LocalDate date) {
        return historicalPriceRepository.findByCoinIdAndDate(coinId, date)
                .map(HistoricalPrice::getEurPrice)
                .orElseGet(() -> fetchAndCache(coinId, date));
    }

    private BigDecimal fetchAndCache(String coinId, LocalDate date) {
        BigDecimal price = coinGeckoClient.getHistoricalPriceInEur(coinId, date);
        historicalPriceRepository.save(
                HistoricalPrice.builder()
                        .coinId(coinId)
                        .date(date)
                        .eurPrice(price)
                        .build()
        );
        return price;
    }
}
