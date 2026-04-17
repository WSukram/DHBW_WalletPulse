package de.dhbwravensburg.webengeneering2.walletpulse.backend.repository;

import de.dhbwravensburg.webengeneering2.walletpulse.backend.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WalletRepository extends JpaRepository <Wallet, Long> {
}
