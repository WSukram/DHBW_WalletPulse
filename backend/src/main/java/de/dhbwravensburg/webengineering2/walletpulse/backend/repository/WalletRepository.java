package de.dhbwravensburg.webengineering2.walletpulse.backend.repository;

import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WalletRepository extends JpaRepository <Wallet, Long> {
}
