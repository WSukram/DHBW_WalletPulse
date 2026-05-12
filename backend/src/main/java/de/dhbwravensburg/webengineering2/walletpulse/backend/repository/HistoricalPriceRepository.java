package de.dhbwravensburg.webengineering2.walletpulse.backend.repository;

import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.HistoricalPrice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface HistoricalPriceRepository extends JpaRepository<HistoricalPrice, Long> {
    Optional<HistoricalPrice> findByCoinIdAndDate(String coinId, LocalDate date);
}
