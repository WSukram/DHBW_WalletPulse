package de.dhbwravensburg.webengineering2.walletpulse.backend.config;

import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Asset;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Transaction;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Wallet;
import de.dhbwravensburg.webengineering2.walletpulse.backend.repository.WalletRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedDatabase(WalletRepository walletRepository) {
        return args -> {
            if (walletRepository.count() > 0) return;

            Wallet wallet = Wallet.builder()
                    .name("Main HODL Wallet")
                    .build();

            Asset btc = Asset.builder()
                    .coinId("bitcoin")
                    .wallet(wallet)
                    .build();

            Asset eth = Asset.builder()
                    .coinId("ethereum")
                    .wallet(wallet)
                    .build();

            Asset sol = Asset.builder()
                    .coinId("solana")
                    .wallet(wallet)
                    .build();

            btc.setTransactions(List.of(
                    Transaction.builder().asset(btc).amount(1.0).buyPrice(30000).date(LocalDate.of(2023, 1, 15)).build(),
                    Transaction.builder().asset(btc).amount(0.542).buyPrice(28000).date(LocalDate.of(2023, 3, 10)).build()
            ));

            eth.setTransactions(List.of(
                    Transaction.builder().asset(eth).amount(5.0).buyPrice(1800).date(LocalDate.of(2023, 2, 20)).build(),
                    Transaction.builder().asset(eth).amount(3.4).buyPrice(1920).date(LocalDate.of(2023, 6, 5)).build()
            ));

            sol.setTransactions(List.of(
                    Transaction.builder().asset(sol).amount(60.0).buyPrice(20).date(LocalDate.of(2023, 4, 1)).build(),
                    Transaction.builder().asset(sol).amount(45.0).buyPrice(22).date(LocalDate.of(2023, 7, 18)).build()
            ));

            wallet.setAssets(List.of(btc, eth, sol));
            walletRepository.save(wallet);
        };
    }
}
